## Creado por Camilo Martinez
## Fecha: 27/04/2026
from config import db

class Insumo(db.Model):
    __tablename__ = 'insumo'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)          # precio original (retrocompat.)
    precio_unidad = db.Column(db.Numeric(10, 2), nullable=True)    # precio de compra por unidad de medida
    cantidad = db.Column(db.Integer, nullable=False)
    unidad_medida = db.Column(db.String(20), nullable=True, default='gr')
    stock_minimo = db.Column(db.Float, nullable=True, default=0.0)

    def get_precio_unidad(self) -> float:
        """Retorna precio_unidad si está definido, sino cae a precio (retrocompat.)."""
        if self.precio_unidad is not None:
            return float(self.precio_unidad)
        return float(self.precio) if self.precio else 0.0

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "nombre": self.nombre,
            "cantidad": self.cantidad,
            "unidad_medida": self.unidad_medida or "gr",
            "stock_minimo": float(self.stock_minimo) if self.stock_minimo else 0.0,
            "precio_unidad": self.get_precio_unidad(),
        }

    def __repr__(self):
        return f'<Insumo {self.nombre}>'