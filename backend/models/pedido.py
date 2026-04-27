## Creado por Camilo Martinez
## Fecha: 27/04/2026

from config import db
from datetime import datetime

class Pedido(db.Model):
    __tablename__ = 'pedido'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente = db.Column(db.String(100), nullable=False)
    pizzas = db.Column(db.Text, nullable=False)
    direccion = db.Column(db.String(200), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
