## Creado por Camilo Martinez
## Fecha: 27/04/2026
from flask import Blueprint, request, redirect, render_template, url_for, flash, jsonify
from flask_cors import cross_origin  # <--- Asegúrate que esté aquí solo
from models.pedido import Pedido
from models.insumo import Insumo
from config import db
import jwt as pyjwt
from datetime import datetime, timedelta, timezone

# Definición del Blueprint
pedidos_blueprint = Blueprint('pedidos', __name__, url_prefix='/api')

@pedidos_blueprint.route('/nuevo', methods=['GET', 'POST'])
def nuevo_pedido():
    if request.method == 'POST':
        cliente = request.form.get('cliente')
        pizza_seleccionada = request.form.get('pizzas')
        direccion = request.form.get('direccion')

        # VALIDACIÓN: Si falta algo, detenemos el proceso
        if not cliente or not direccion or not pizza_seleccionada:
            return "<h1>⚠️ Error: Todos los campos son obligatorios.</h1><a href='/pedidos/nuevo'>Volver</a>"

        # 2. Creamos el objeto solo si pasó la validación
        nuevo = Pedido(
            cliente=cliente,
            pizzas=pizza_seleccionada,
            direccion=direccion
        )

        try:
            db.session.add(nuevo)
            db.session.commit()
            return redirect(url_for('pedidos.listar_pedidos'))
        except Exception as e:
            db.session.rollback()
            return f"Error al guardar: {str(e)}"

    ## Si es GET, solo mostramos el formulario con los insumos
    insumos = Insumo.query.all()
    return render_template('pedidos/crear_pedido.html', insumos=insumos)
    
@pedidos_blueprint.route('/listar')
def listar_pedidos():
    todos_los_pedidos = Pedido.query.order_by(Pedido.fecha.desc()).all()
    return render_template('pedidos/listar_pedidos.html', pedidos=todos_los_pedidos)

@pedidos_blueprint.route('/pedidos', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def api_pedidos():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    if request.method == 'POST':
        try:
            data = request.get_json()
            articulos = data.get('articulos', [])
            
            import json
            # Crear string de pizzas para retrocompatibilidad
            pizzas_str = ", ".join([f"{a.get('cantidad', 1)}x {a.get('nombre', '')} {a.get('tamano', '')}" for a in articulos])
            
            nuevo_pedido = Pedido(
                cliente=str(data.get('usuario_id', 'Guest')),
                direccion="Recoger en local", # Default fallback
                pizzas=pizzas_str,
                total=data.get('total', 0.0),
                estado="Pendiente",
                articulos_json=json.dumps(articulos)
            )
            db.session.add(nuevo_pedido)
            db.session.commit()
            return jsonify({"message": "Pedido creado", "id": nuevo_pedido.id}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    try:
        todos_los_pedidos = Pedido.query.order_by(Pedido.fecha.desc()).all()
        pedidos_json = [
            {
                "id": p.id, 
                "cliente": p.cliente, 
                "pizzas": p.pizzas, 
                "direccion": p.direccion,
                "total": float(p.total) if p.total else 0.0,
                "estado": p.estado or "Pendiente",
                "fecha": p.fecha.strftime("%Y-%m-%d %H:%M:%S") if p.fecha else ""
            } for p in todos_los_pedidos
        ]
        return jsonify({
            "pedidos": pedidos_json,
            "total_pedidos": len(pedidos_json)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@pedidos_blueprint.route('/pedidos/<int:id>/estado', methods=['PATCH', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def api_actualizar_estado_pedido(id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    try:
        data = request.get_json()
        nuevo_estado = data.get('estado')
        
        pedido = Pedido.query.get(id)
        if not pedido:
            return jsonify({"error": "Pedido no encontrado"}), 404
            
        pedido.estado = nuevo_estado
        
        # LÓGICA DE DESCUENTO DE INVENTARIO
        if nuevo_estado in ["Preparando", "Entregado"] and not pedido.inventario_deducido:
            import json
            from models.producto import RecetaItem
            
            if pedido.articulos_json:
                articulos = json.loads(pedido.articulos_json)
                for art in articulos:
                    pizza_id = art.get('pizza_id')
                    if not pizza_id: continue
                    cantidad_pedida = art.get('cantidad', 1)
                    
                    # Buscar receta de este producto
                    receta_items = RecetaItem.query.filter_by(producto_id=pizza_id).all()
                    for r_item in receta_items:
                        # Descontar insumo proporcionalmente
                        insumo = r_item.insumo
                        if insumo:
                            descuento_total = r_item.cantidad_gastada * cantidad_pedida
                            insumo.cantidad = float(insumo.cantidad) - descuento_total
                            
            pedido.inventario_deducido = True
            
        db.session.commit()
        return jsonify({"message": "Estado actualizado"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@pedidos_blueprint.route('/auth/login', methods=['POST'])
def login():
    # Usamos force=True por si Angular no envía el header exacto
    data = request.get_json(force=True) 
    email = data.get('email', '').strip() # .strip() quita espacios invisibles
    contrasena = data.get('contrasena', '').strip()

    # Imprime en la terminal para que veas qué llega
    print(f"DEBUG: Intentando login con email: '{email}' y contrasena: '{contrasena}'")

    if email == 'admin@pizzeria.com' and contrasena == 'admin123':
        # Generar un JWT real en lugar de string quemado
        carga_util = {
            "sub": "1", 
            "nombre": "Admin PizzaOS", 
            "email": email, 
            "rol": "admin", 
            "exp": datetime.now(timezone.utc) + timedelta(hours=168)
        }
        token_real = pyjwt.encode(carga_util, "pizzeria_secret_key_fixed_2026_super_safe", algorithm="HS256")

        return jsonify({
            "access_token": token_real,
            "usuario": {"id": 1, "nombre": "Admin PizzaOS", "email": email, "rol": "admin"}
        }), 200
    
    return jsonify({"error": "Usuario o contraseña incorrectos"}), 401

from flask_cors import cross_origin

@pedidos_blueprint.route('/pizzas', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def api_pizzas():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    from models.producto import Producto, Categoria

    if request.method == 'POST':
        try:
            data = request.get_json()
            categoria_nombre = data.get('categoria', 'Pizza')
            
            # Buscar o crear categoría
            cat = Categoria.query.filter_by(nombre=categoria_nombre).first()
            if not cat:
                cat = Categoria(nombre=categoria_nombre)
                db.session.add(cat)
                db.session.commit()
                
            nuevo_prod = Producto(
                nombre=data.get('nombre'),
                descripcion=data.get('descripcion', ''),
                precio_1=data.get('precio_1', data.get('precio', 0.0)),
                precio_2=data.get('precio_2'),
                precio_3=data.get('precio_3'),
                categoria_id=cat.id
            )
            db.session.add(nuevo_prod)
            db.session.commit()
            
            return jsonify({
                "id": nuevo_prod.id,
                "nombre": nuevo_prod.nombre,
                "categoria": cat.nombre,
                "precio_1": nuevo_prod.precio_1,
                "precio_2": nuevo_prod.precio_2,
                "precio_3": nuevo_prod.precio_3
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    try:
        productos = Producto.query.all()
        pizzas_json = [
            {
                "id": p.id, 
                "nombre": p.nombre, 
                "descripcion": p.descripcion,
                "precio": float(p.precio_1), 
                "precio_1": float(p.precio_1) if p.precio_1 is not None else None,
                "precio_2": float(p.precio_2) if p.precio_2 is not None else None,
                "precio_3": float(p.precio_3) if p.precio_3 is not None else None,
                "categoria": p.categoria.nombre if p.categoria else "Pizza",
                "cantidad": 50 # Dummy temporal
            } for p in productos
        ]
        return jsonify(pizzas_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@pedidos_blueprint.route('/insumos', methods=['GET', 'POST'])
def api_insumos():
    if request.method == 'POST':
        data = request.get_json()
        nuevo = Insumo(
            nombre=data.get('nombre'),
            cantidad=data.get('cantidad', 0),
            unidad_medida=data.get('unidad_medida', 'gr'),
            precio=0 # Default for now
        )
        db.session.add(nuevo)
        db.session.commit()
        return jsonify({
            "id": nuevo.id, "nombre": nuevo.nombre, "cantidad": nuevo.cantidad,
            "unidad_medida": nuevo.unidad_medida, "stock_minimo": 0
        }), 201
        
    try:
        insumos = Insumo.query.all()
        insumos_json = [
            {
                "id": i.id, 
                "nombre": i.nombre, 
                "cantidad": i.cantidad,
                "unidad_medida": getattr(i, 'unidad_medida', 'gr'),
                "stock_minimo": getattr(i, 'stock_minimo', 0)
            } for i in insumos
        ]
        return jsonify(insumos_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from flask_cors import cross_origin
@pedidos_blueprint.route('/pizzas/<int:id>/receta', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(supports_credentials=True)
def api_receta(id):
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    from models.producto import RecetaItem
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            # Borrar receta anterior de este producto
            RecetaItem.query.filter_by(producto_id=id).delete()
            
            # Insertar los nuevos items
            nuevos_items = []
            for item in data:
                nuevo = RecetaItem(
                    producto_id=id,
                    insumo_id=item['insumo_id'],
                    cantidad_gastada=item['cantidad_gastada']
                )
                db.session.add(nuevo)
                nuevos_items.append(nuevo)
                
            db.session.commit()
            return jsonify({"message": "Receta actualizada"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

    try:
        receta_items = RecetaItem.query.filter_by(producto_id=id).all()
        receta_json = [
            {
                "pizza_id": r.producto_id,
                "insumo_id": r.insumo_id,
                "insumo_nombre": r.insumo.nombre,
                "cantidad_gastada": float(r.cantidad_gastada),
                "unidad_medida": getattr(r.insumo, 'unidad_medida', 'gr')
            } for r in receta_items
        ]
        return jsonify({"receta": receta_json}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
