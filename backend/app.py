## Creado por: Camilo Martinez
## Fecha: 10/04/2026
## Proyecto: Pizzería App Core
"""API REST Flask (SQLite + JWT + CORS)."""

from __future__ import annotations
import os
import json
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any, Dict

import jwt as pyjwt
from flask import Flask, Response, g, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# --- Base de datos ---
db = SQLAlchemy()

class Usuario(db.Model):
    __tablename__ = "usuarios"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    contrasena_hash = db.Column(db.String(256), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default="cliente")
    fecha_registro = db.Column(db.String(20), nullable=False, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    def serializar(self) -> Dict[str, Any]:
        return {"id": self.id, "nombre": self.nombre, "email": self.email, "rol": self.rol, "fecha_registro": self.fecha_registro}

class Pedido(db.Model):
    __tablename__ = "pedidos"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=True)
    fecha_hora = db.Column(db.String(20), nullable=False, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    iva = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)
    articulos = db.relationship("ItemPedido", backref="pedido_relacionado", lazy=True, cascade="all, delete-orphan")

    def serializar(self) -> Dict[str, Any]:
        return {
            "id": self.id, "usuario_id": self.usuario_id, "fecha_hora": self.fecha_hora,
            "articulos": [a.serializar() for a in self.articulos],
            "subtotal": round(self.subtotal, 2), "iva": round(self.iva, 2), "total": round(self.total, 2)
        }

class ItemPedido(db.Model):
    __tablename__ = "items_pedido"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey("pedidos.id"), nullable=False)
    nombre = db.Column(db.String(100), nullable=False)
    tamano = db.Column(db.String(50), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False, default=1)
    precio = db.Column(db.Float, nullable=False, default=0.0)

    def serializar(self) -> Dict[str, Any]:
        return {"nombre": self.nombre, "tamano": self.tamano, "cantidad": self.cantidad, "precio": self.precio}

class Insumo(db.Model):
    __tablename__ = 'insumos'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    cantidad_actual = db.Column(db.Float, default=0.0)
    unidad_medida = db.Column(db.String(20), nullable=False)
    stock_minimo = db.Column(db.Float, default=10.0)

    def to_dict(self):
        return {
            "id": self.id, "nombre": self.nombre, "cantidad_actual": self.cantidad_actual,
            "unidad_medida": self.unidad_medida, "stock_minimo": self.stock_minimo
        }

class Pizza(db.Model):
    __tablename__ = 'pizzas'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255), nullable=True)
    categoria = db.Column(db.String(50), nullable=False, default='Pizza')
    precio_1 = db.Column(db.Float, nullable=False, default=0.0)
    precio_2 = db.Column(db.Float, nullable=True, default=0.0)
    precio_3 = db.Column(db.Float, nullable=True, default=0.0)
    activo = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "categoria": self.categoria,
            "precio_1": self.precio_1,
            "precio_2": self.precio_2,
            "precio_3": self.precio_3,
            "activo": self.activo
        }

# --- Aplicación ---
RUTA_DB: str = os.path.join(os.path.dirname(__file__), "pizzeria_core.db")
JWT_SECRET: str = os.environ.get("JWT_SECRET", "pizzeria-app-core-dev-secret")
JWT_EXPIRACION_HORAS: int = 24

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{RUTA_DB}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

@app.after_request
def agregar_headers_cors(respuesta: Response) -> Response:
    respuesta.headers["Access-Control-Allow-Origin"] = "*"
    respuesta.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    respuesta.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return respuesta

# --- Helpers JWT ---
def _extraer_token_bearer() -> str | None:
    encabezado: str = request.headers.get("Authorization", "")
    partes: list[str] = encabezado.split()
    return partes[1] if len(partes) == 2 and partes[0].lower() == "bearer" else None

def _resolver_jwt():
    if request.method == "OPTIONS": return Response(status=204)
    token = _extraer_token_bearer()
    if not token: return jsonify({"error": "Token requerido"}), 401
    try:
        g.jwt = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except pyjwt.ExpiredSignatureError: return jsonify({"error": "Token expirado"}), 401
    except pyjwt.InvalidTokenError: return jsonify({"error": "Token invalido"}), 401
    return None

def requiere_autenticacion(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        fallo = _resolver_jwt()
        return fallo if fallo is not None else func(*args, **kwargs)
    return wrapper

def requiere_admin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        fallo = _resolver_jwt()
        if fallo is not None: return fallo
        if str(g.jwt.get("rol", "")) != "admin": return jsonify({"error": "Se requiere rol administrador"}), 403
        return func(*args, **kwargs)
    return wrapper

def _generar_token(usuario: Usuario) -> str:
    carga_util = {"sub": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol, "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRACION_HORAS)}
    return pyjwt.encode(carga_util, JWT_SECRET, algorithm="HS256")

# --- Inicialización de DB ---
with app.app_context():
    db.create_all()
    print(f"[INFO] Base de datos lista: {RUTA_DB}")

    # Migración manual pedidos
    try:
        with db.engine.connect() as conn:
            columnas = [fila[1] for fila in conn.exec_driver_sql("PRAGMA table_info(pedidos);").fetchall()]
            if "usuario_id" not in columnas:
                conn.exec_driver_sql("ALTER TABLE pedidos ADD COLUMN usuario_id INTEGER;")
                print("[INFO] Migracion aplicada: pedidos.usuario_id")
    except Exception as exc: print(f"[WARN] No se pudo verificar migracion: {exc}")

    # Admin por defecto
    if not Usuario.query.filter_by(email="admin@pizzeria.com").first():
        admin = Usuario(nombre="Administrador", email="admin@pizzeria.com", contrasena_hash=generate_password_hash("admin1"), rol="admin")
        db.session.add(admin)
        db.session.commit()
        print("[INFO] Usuario admin creado")

    # Insumos por defecto
    if not Insumo.query.first():
        insumos = [
            Insumo(nombre="Harina", cantidad_actual=50.0, unidad_medida="kg", stock_minimo=10.0),
            Insumo(nombre="Queso Mozzarella", cantidad_actual=20.0, unidad_medida="kg", stock_minimo=5.0),
            Insumo(nombre="Salsa de Tomate", cantidad_actual=15.0, unidad_medida="litros", stock_minimo=3.0)
        ]
        db.session.add_all(insumos)
        db.session.commit()
        print("[INFO] Insumos iniciales creados")

    # Pizzas por defecto
    if not Pizza.query.first():
        pizzas_seed = [
            Pizza(nombre="Hawaiana", descripcion="Piña y jamón", categoria="Pizza", precio_1=20000, precio_2=30000, precio_3=40000),
            Pizza(nombre="Pepperoni", descripcion="Pepperoni clásico", categoria="Pizza", precio_1=22000, precio_2=32000, precio_3=42000),
            Pizza(nombre="Coca Cola", descripcion="Gaseosa refrescante", categoria="Gaseosa", precio_1=5000, precio_2=8000, precio_3=12000),
            Pizza(nombre="Lasaña de Carne", descripcion="Tradicional italiana", categoria="Lasaña", precio_1=25000, precio_2=35000, precio_3=None),
            Pizza(nombre="Palitos de Ajo", descripcion="Orden de 6 unidades", categoria="Otros", precio_1=15000, precio_2=None, precio_3=None)
        ]
        db.session.add_all(pizzas_seed)
        db.session.commit()
        print("[INFO] Productos iniciales creados")

# --- RUTAS API ---
@app.route("/api/auth/registro", methods=["POST"])
def registro():
    datos = request.get_json() or {}
    email = str(datos.get("email", "")).strip().lower()
    if Usuario.query.filter_by(email=email).first(): return jsonify({"error": "El email ya esta registrado"}), 409
    nuevo = Usuario(nombre=datos.get("nombre"), email=email, contrasena_hash=generate_password_hash(datos.get("contrasena")), rol="cliente")
    db.session.add(nuevo); db.session.commit()
    return jsonify({"access_token": _generar_token(nuevo), "usuario": nuevo.serializar()}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    datos = request.get_json() or {}
    usuario = Usuario.query.filter_by(email=str(datos.get("email", "")).lower()).first()
    if not usuario or not check_password_hash(usuario.contrasena_hash, datos.get("contrasena")): return jsonify({"error": "Credenciales incorrectas"}), 401
    return jsonify({"access_token": _generar_token(usuario), "usuario": usuario.serializar()}), 200

@app.route("/api/pizzas", methods=["GET", "POST"])
def gestionar_pizzas():
    if request.method == "POST":
        datos = request.get_json() or {}
        nueva = Pizza(
            nombre=datos.get('nombre'),
            descripcion=datos.get('descripcion'),
            categoria=datos.get('categoria', 'Pizza'),
            precio_1=float(datos.get('precio_1', 0.0) or 0),
            precio_2=float(datos.get('precio_2') or 0) if datos.get('precio_2') else None,
            precio_3=float(datos.get('precio_3') or 0) if datos.get('precio_3') else None
        )
        db.session.add(nueva)
        db.session.commit()
        return jsonify({"status": "ok", "pizza": nueva.to_dict()}), 201
    
    # GET - Devuelve solo pizzas activas
    return jsonify({"pizzas": [p.to_dict() for p in Pizza.query.filter_by(activo=True).all()]})

@app.route("/api/pizzas/<int:id>", methods=["DELETE"])
def eliminar_pizza(id):
    pizza = Pizza.query.get_or_404(id)
    db.session.delete(pizza) # Hard delete
    db.session.commit()
    return jsonify({"status": "ok", "mensaje": "Pizza eliminada permanentemente"})

@app.route("/api/pizzas/<int:id>", methods=["PUT"])
def actualizar_pizza(id):
    pizza = Pizza.query.get_or_404(id)
    datos = request.get_json() or {}
    if 'nombre' in datos: pizza.nombre = datos['nombre']
    if 'descripcion' in datos: pizza.descripcion = datos['descripcion']
    if 'categoria' in datos: pizza.categoria = datos['categoria']
    if 'precio_1' in datos: pizza.precio_1 = float(datos['precio_1']) if datos['precio_1'] else None
    if 'precio_2' in datos: pizza.precio_2 = float(datos['precio_2']) if datos['precio_2'] else None
    if 'precio_3' in datos: pizza.precio_3 = float(datos['precio_3']) if datos['precio_3'] else None
    if 'activo' in datos: pizza.activo = bool(datos['activo'])
    db.session.commit()
    return jsonify({"status": "ok", "pizza": pizza.to_dict()})

@app.route('/api/insumos', methods=['GET'])
def get_insumos():
    return jsonify([i.to_dict() for i in Insumo.query.all()])

@app.route('/api/insumos', methods=['POST'])
def add_insumo():
    data = request.get_json()
    nuevo_insumo = Insumo(
        nombre=data['nombre'],
        cantidad_actual=data.get('cantidad_actual', 0.0),
        stock_minimo=data.get('stock_minimo', 0.0),
        unidad_medida=data.get('unidad_medida', 'kg')
    )
    db.session.add(nuevo_insumo)
    db.session.commit()
    return jsonify({"status": "ok", "insumo": nuevo_insumo.to_dict()}), 201

@app.route('/api/insumos/<int:id>', methods=['PUT'])
def update_insumo(id):
    data = request.get_json()
    insumo = Insumo.query.get_or_404(id)
    if 'cantidad_actual' in data: insumo.cantidad_actual = float(data['cantidad_actual'])
    db.session.commit()
    return jsonify(insumo.to_dict())

@app.route('/api/insumos/<int:id>', methods=['DELETE'])
def delete_insumo(id):
    insumo = Insumo.query.get_or_404(id)
    db.session.delete(insumo)
    db.session.commit()
    return jsonify({"status": "ok", "mensaje": "Insumo eliminado."})

@app.route("/api/health", methods=["GET"])
def estado_servidor(): return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)