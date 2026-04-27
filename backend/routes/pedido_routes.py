## Creado por Camilo Martinez
## Fecha: 27/04/2026
from flask import Blueprint, request, redirect, render_template, url_for, flash
from models.pedido import Pedido
from models.insumo import Insumo
from config import db

pedidos_blueprint = Blueprint('pedidos', __name__, url_prefix='/pedidos')

from models.pedido import Pedido # Asegúrate de tener este import arriba

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

@pedidos_blueprint.route('/api/pizzas', methods=['GET'])
def api_get_pizzas():
    try:
        insumos = Insumo.query.all()
        ## Convertimos los objetos de la base de datos a una lista JSON
        pizzas_json = [
            {
                "id": p.id, 
                "nombre": p.nombre, 
                "precio": float(p.precio), 
                "cantidad": p.cantidad
            } for p in insumos
        ]
        return jsonify(pizzas_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
