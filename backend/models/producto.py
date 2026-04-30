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

class RecetaItem(db.Model):
    __tablename__ = 'receta_item'
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('producto.id'), nullable=False)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumo.id'), nullable=False)
    cantidad_gastada = db.Column(db.Float, nullable=False)
    
    insumo = db.relationship('Insumo')
    producto = db.relationship('Producto', backref=db.backref('receta', cascade='all, delete-orphan'))