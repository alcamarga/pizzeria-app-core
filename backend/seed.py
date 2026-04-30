## Creado por Camilo Martinez - Pizzería Core
## Fecha: 30/04/2026

import sys
import os

# Forzamos a Python a reconocer la carpeta actual como base
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app import app
from config import db

def seed_data():
    with app.app_context():
        print("Iniciando alimentación de base de datos...")
        
        # Importación directa ahora que forzamos el path
        from models.producto import Producto
        from models.producto import Categoria

        # 1. Crear categoría base (si no existe)
        cat_pizzas = Categoria(nombre="Pizzas Clásicas")
        db.session.add(cat_pizzas)
        db.session.commit() 

        # 2. Crear las Pizzas
        lista_pizzas = [
            Producto(nombre="Pizza Pepperoni", precio_1=12.50, categoria_id=cat_pizzas.id, descripcion="Clásica"),
            Producto(nombre="Pizza Hawaiana", precio_1=13.00, categoria_id=cat_pizzas.id, descripcion="Piña y Jamón"),
            Producto(nombre="Pizza Vegetariana", precio_1=11.50, categoria_id=cat_pizzas.id, descripcion="Vegetales"),
            Producto(nombre="Pizza Pollo y Champiñones", precio_1=14.00, categoria_id=cat_pizzas.id, descripcion="Pollo")
        ]
        
        db.session.add_all(lista_pizzas)
        db.session.commit()
        print("¡Base de datos alimentada con PRODUCTOS! 🍕")

        # 3. Crear Insumos Reales
        from models.insumo import Insumo
        lista_insumos = [
            Insumo(nombre="Harina", precio=2.5, cantidad=10000, unidad_medida="gr", stock_minimo=1000),
            Insumo(nombre="Queso Mozzarella", precio=5.0, cantidad=5000, unidad_medida="gr", stock_minimo=500),
            Insumo(nombre="Pepperoni", precio=8.0, cantidad=2000, unidad_medida="gr", stock_minimo=200),
            Insumo(nombre="Salsa de Tomate", precio=3.0, cantidad=3000, unidad_medida="ml", stock_minimo=500)
        ]
        db.session.add_all(lista_insumos)
        db.session.commit()
        print("¡Base de datos alimentada con INSUMOS! 🧀")

if __name__ == "__main__":
    seed_data()