## Creado por Camilo Martinez
## Proyecto: Pizzería Core
## Fecha: 01/05/2026

from config import db
from datetime import datetime


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    contrasena_hash = db.Column(db.String(256), nullable=False)
    rol = db.Column(db.String(20), nullable=False, default='cliente')
    fecha_registro = db.Column(
        db.String(20),
        nullable=False,
        default=lambda: datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    )

    def serializar(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'email': self.email,
            'rol': self.rol,
            'fecha_registro': self.fecha_registro
        }
