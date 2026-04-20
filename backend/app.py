## Creado por: Camilo Martinez
## Fecha: 10/04/2026
## Proyecto: Pizzería App Core
"""API REST Flask (SQLite + JWT + CORS).

Alineado con las reglas de operación en WSL Ubuntu definidas en el repositorio:
  ../.cursor-rules/instrucciones-sistema.md

En particular:
  - Entorno virtual esperado: backend/.venv → activar con:
      source backend/.venv/bin/activate
  - Servidor de desarrollo: puerto por defecto 5000 (variable de entorno PORT).
  - Escucha en 0.0.0.0 para desarrollo en WSL/red local.
  - CORS habilitado para trabajar con Angular en el puerto 4200 (u otros orígenes en dev).
"""

from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Any, Dict

import jwt as pyjwt
from flask import Flask, Response, g, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

# --- Base de datos (modelos en este módulo para arranque mínimo del core) ---

db = SQLAlchemy()


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    contrasena_hash = db.Column(db.String(256), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default="cliente")
    fecha_registro = db.Column(
        db.String(20),
        nullable=False,
        default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )

    def serializar(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "rol": self.rol,
            "fecha_registro": self.fecha_registro,
        }


class Pedido(db.Model):
    __tablename__ = "pedidos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=True)
    fecha_hora = db.Column(
        db.String(20),
        nullable=False,
        default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    subtotal = db.Column(db.Float, nullable=False, default=0.0)
    iva = db.Column(db.Float, nullable=False, default=0.0)
    total = db.Column(db.Float, nullable=False, default=0.0)

    articulos = db.relationship(
        "ItemPedido",
        backref="pedido_relacionado",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def serializar(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "fecha_hora": self.fecha_hora,
            "articulos": [a.serializar() for a in self.articulos],
            "subtotal": round(self.subtotal, 2),
            "iva": round(self.iva, 2),
            "total": round(self.total, 2),
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
        return {
            "nombre": self.nombre,
            "tamano": self.tamano,
            "cantidad": self.cantidad,
            "precio": self.precio,
        }


# --- Aplicación ---

RUTA_DB: str = os.path.join(os.path.dirname(__file__), "pizzeria_core.db")
JWT_SECRET: str = os.environ.get("JWT_SECRET", "pizzeria-app-core-dev-secret")
JWT_EXPIRACION_HORAS: int = 24

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{RUTA_DB}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# CORS amplio en dev: permite Angular en localhost:4200 y otros orígenes | Broad CORS in dev: allows Angular on localhost:4200 and other origins
CORS(
    app,
    resources={
        r"/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)


@app.after_request
def agregar_headers_cors(respuesta: Response) -> Response:
    respuesta.headers["Access-Control-Allow-Origin"] = "*"
    respuesta.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    respuesta.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return respuesta


def _extraer_token_bearer() -> str | None:
    encabezado: str = request.headers.get("Authorization", "")
    partes: list[str] = encabezado.split()
    if len(partes) == 2 and partes[0].lower() == "bearer":
        return partes[1]
    return None


def _resolver_jwt() -> Response | tuple[Response, int] | None:
    if request.method == "OPTIONS":
        return Response(status=204)

    token: str | None = _extraer_token_bearer()
    if not token:
        return jsonify({"error": "Token requerido"}), 401

    try:
        g.jwt = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except pyjwt.ExpiredSignatureError:
        return jsonify({"error": "Token expirado"}), 401
    except pyjwt.InvalidTokenError:
        return jsonify({"error": "Token invalido"}), 401

    return None


def requiere_autenticacion(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        fallo = _resolver_jwt()
        if fallo is not None:
            return fallo
        return func(*args, **kwargs)

    return wrapper


def requiere_admin(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        fallo = _resolver_jwt()
        if fallo is not None:
            return fallo
        if str(g.jwt.get("rol", "")) != "admin":
            return jsonify({"error": "Se requiere rol administrador"}), 403
        return func(*args, **kwargs)

    return wrapper


def _generar_token(usuario: Usuario) -> str:
    carga_util: dict = {
        "sub": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "rol": usuario.rol,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRACION_HORAS),
    }
    return pyjwt.encode(carga_util, JWT_SECRET, algorithm="HS256")


with app.app_context():
    db.create_all()
    print(f"[INFO] Base de datos lista: {RUTA_DB}")

    try:
        with db.engine.connect() as conn:
            columnas = [
                fila[1]
                for fila in conn.exec_driver_sql("PRAGMA table_info(pedidos);").fetchall()
            ]
            if "usuario_id" not in columnas:
                conn.exec_driver_sql("ALTER TABLE pedidos ADD COLUMN usuario_id INTEGER;")
                print("[INFO] Migracion aplicada: pedidos.usuario_id")
    except Exception as exc:
        print(f"[WARN] No se pudo verificar/aplicar migracion usuario_id: {exc}")

    if not Usuario.query.filter_by(email="admin@pizzeria.com").first():
        admin = Usuario(
            nombre="Administrador",
            email="admin@pizzeria.com",
            contrasena_hash=generate_password_hash("admin1"),
            rol="admin",
        )
        db.session.add(admin)
        db.session.commit()
        print("[INFO] Usuario admin creado: admin@pizzeria.com")


@app.route("/api/auth/registro", methods=["POST"])
def registro() -> tuple[Response, int]:
    datos: dict = request.get_json() or {}
    nombre: str = str(datos.get("nombre", "")).strip()
    email: str = str(datos.get("email", "")).strip().lower()
    contrasena: str = str(datos.get("contrasena", ""))

    if not nombre or not email or not contrasena:
        return jsonify({"error": "Todos los campos son obligatorios"}), 400

    if len(contrasena) < 6:
        return jsonify({"error": "La contrasena debe tener al menos 6 caracteres"}), 400

    if Usuario.query.filter_by(email=email).first():
        return jsonify({"error": "El email ya esta registrado"}), 409

    nuevo_usuario = Usuario(
        nombre=nombre,
        email=email,
        contrasena_hash=generate_password_hash(contrasena),
        rol="cliente",
    )
    db.session.add(nuevo_usuario)
    db.session.commit()

    token: str = _generar_token(nuevo_usuario)
    return jsonify({"access_token": token, "usuario": nuevo_usuario.serializar()}), 201


@app.route("/api/auth/login", methods=["POST"])
def login() -> tuple[Response, int]:
    datos: dict = request.get_json() or {}
    email: str = str(datos.get("email", "")).strip().lower()
    contrasena: str = str(datos.get("contrasena", ""))

    usuario: Usuario | None = Usuario.query.filter_by(email=email).first()

    if not usuario or not check_password_hash(usuario.contrasena_hash, contrasena):
        return jsonify({"error": "Credenciales incorrectas"}), 401

    token: str = _generar_token(usuario)
    return jsonify({"access_token": token, "usuario": usuario.serializar()}), 200


# 1. Definimos la lista inicial (con las 3 clásicas) fuera de las rutas
PIZZAS_DATOS = [
    {
        "id": 1,
        "nombre": "Hawaiana",
        "descripcion": "Salsa de tomate, queso mozzarella, jamon y pina",
        "variantes": [{"tamano": "Personal", "precio": 20000}, {"tamano": "Mediana", "precio": 25000}, {"tamano": "Familiar", "precio": 32500}],
        "activo": True,
    },
    {
        "id": 2,
        "nombre": "Pepperoni",
        "descripcion": "Salsa de tomate, queso mozzarella y pepperoni",
        "variantes": [{"tamano": "Personal", "precio": 22000}, {"tamano": "Mediana", "precio": 28000}, {"tamano": "Familiar", "precio": 36400}],
        "activo": True,
    },
    {
        "id": 3,
        "nombre": "Vegetariana",
        "descripcion": "Salsa de tomate, queso mozzarella, champinones, pimientos y cebolla",
        "variantes": [{"tamano": "Personal", "precio": 21000}, {"tamano": "Mediana", "precio": 27000}, {"tamano": "Familiar", "precio": 35100}],
        "activo": True,
    }
]

@app.route("/api/pizzas", methods=["GET", "POST"])
def gestionar_pizzas() -> Response:
    global PIZZAS_DATOS  # Esto le dice a Python que use la lista de arriba
    
    if request.method == "POST":
        datos = request.get_json() or {}
        
        # Creamos la estructura que Angular espera recibir
        nueva_pizza = {
            "id": len(PIZZAS_DATOS) + 1,
            "nombre": datos.get('nombre', 'Nueva Pizza'),
            "descripcion": datos.get('descripcion', ''),
            "variantes": [
                {"tamano": "Personal", "precio": datos.get('precioPersonal', 0)},
                {"tamano": "Mediana", "precio": datos.get('precioMediana', 0)},
                {"tamano": "Familiar", "precio": datos.get('precioFamiliar', 0)}
            ],
            "activo": True
        }
        
        # ✅ LA MAGIA: Guardamos en la lista global
        PIZZAS_DATOS.append(nueva_pizza)
        print(f"[INFO] ¡Pizza {nueva_pizza['nombre']} guardada con éxito!")
        
        return jsonify({"status": "ok", "pizza": nueva_pizza}), 201

    # Para el GET, simplemente devolvemos la lista completa
    return jsonify({"pizzas": PIZZAS_DATOS})


@app.route("/api/pedidos", methods=["POST"])
@requiere_autenticacion
def recibir_pedido() -> tuple[Response, int]:
    datos: dict = request.get_json() or {}
    articulos_recibidos: list = datos.get("items", [])
    total_recibido: float = float(datos.get("total", 0))

    subtotal: float = round(total_recibido / 1.19, 2)
    iva: float = round(total_recibido - subtotal, 2)

    usuario_id: int | None = None
    try:
        usuario_id = int(g.jwt.get("sub")) if g.jwt.get("sub") is not None else None
    except (TypeError, ValueError):
        usuario_id = None

    nuevo_pedido = Pedido(usuario_id=usuario_id, subtotal=subtotal, iva=iva, total=total_recibido)
    db.session.add(nuevo_pedido)
    db.session.flush()

    for item in articulos_recibidos:
        nuevo_item = ItemPedido(
            pedido_id=nuevo_pedido.id,
            nombre=str(item.get("nombre", "")),
            tamano=str(item.get("tamano", "")),
            cantidad=int(item.get("cantidad", 1)),
            precio=float(item.get("precio", 0)),
        )
        db.session.add(nuevo_item)

    db.session.commit()
    return jsonify({"status": "ok", "id_pedido": nuevo_pedido.id}), 201


@app.route("/api/pedidos", methods=["GET"])
@requiere_admin
def listar_pedidos() -> Response:
    pedidos_db: list[Pedido] = Pedido.query.order_by(Pedido.id.desc()).all()
    return jsonify(
        {"pedidos": [p.serializar() for p in pedidos_db], "total_pedidos": len(pedidos_db)}
    )


@app.route("/api/pedidos/mis", methods=["GET"])
@requiere_autenticacion
def listar_mis_pedidos() -> Response:
    usuario_id: int | None = None
    try:
        usuario_id = int(g.jwt.get("sub")) if g.jwt.get("sub") is not None else None
    except (TypeError, ValueError):
        usuario_id = None

    pedidos_db: list[Pedido] = (
        Pedido.query.filter(Pedido.usuario_id == usuario_id).order_by(Pedido.id.desc()).all()
    )
    return jsonify(
        {"pedidos": [p.serializar() for p in pedidos_db], "total_pedidos": len(pedidos_db)}
    )


@app.route("/api/health", methods=["GET"])
def estado_servidor() -> Response:
    return jsonify({"status": "ok", "service": "Pizzeria App Core API"})


if __name__ == "__main__":
    puerto_servidor: int = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=puerto_servidor, debug=True)
