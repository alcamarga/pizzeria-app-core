## Creado por Camilo Martinez
## Proyecto: Pizzería Core
## Fecha: 30/04/2026

from config import db

class Categoria(db.Model):
    __tablename__ = 'categoria'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    productos = db.relationship('Producto', backref='categoria', lazy=True)

class Producto(db.Model):
    __tablename__ = 'producto'
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.String(255))
    precio_1 = db.Column(db.Float, nullable=False)
    precio_2 = db.Column(db.Float, nullable=True)
    precio_3 = db.Column(db.Float, nullable=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categoria.id'), nullable=False)

    def costo_produccion(self) -> float:
        """
        Calcula el costo de producción sumando (precio_unidad_insumo × cantidad_gastada)
        por cada item de la receta asociada a este producto.
        Usa precio_unidad si está definido, sino cae a precio (retrocompat.).
        Retorna 0.0 si no tiene receta definida.
        """
        total = 0.0
        for item in self.receta:
            insumo = item.insumo
            if insumo and item.cantidad_gastada:
                total += insumo.get_precio_unidad() * float(item.cantidad_gastada)
        return round(total, 2)

    def rentabilidad(self) -> dict:
        """
        Devuelve un dict con costo, precio de venta base (precio_1),
        ganancia absoluta y margen porcentual.
        """
        costo = self.costo_produccion()
        precio_venta = float(self.precio_1) if self.precio_1 else 0.0
        ganancia = round(precio_venta - costo, 2)
        margen = round((ganancia / precio_venta * 100), 1) if precio_venta > 0 else 0.0
        return {
            "id": self.id,
            "nombre": self.nombre,
            "categoria": self.categoria.nombre if self.categoria else "—",
            "costo_produccion": costo,
            "precio_venta": precio_venta,
            "ganancia": ganancia,
            "margen_porcentaje": margen
        }

class RecetaItem(db.Model):
    __tablename__ = 'receta_item'
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumo.id'), nullable=False)
    cantidad_gastada = db.Column(db.Float, nullable=False)

    insumo = db.relationship('Insumo')
    producto = db.relationship('Producto', backref=db.backref('receta', cascade='all, delete-orphan'))