## Creado por Camilo Martinez
## Fecha: 27/04/2026

from app import app
from config import db
from models.insumo import Insumo

def seed_data():
    with app.app_context():
        # Lista de pizzas iniciales
        pizzas = [
            Insumo(nombre="Pizza Pepperoni", precio=12.50, cantidad=50),
            Insumo(nombre="Pizza Hawaiana", precio=13.00, cantidad=40),
            Insumo(nombre="Pizza Vegetariana", precio=11.50, cantidad=30),
            Insumo(nombre="Pizza Pollo y Champiñones", precio=14.00, cantidad=25)
        ]
        
        # Agregamos a la sesión y guardamos
        db.session.add_all(pizzas)
        db.session.commit()
        print("¡Base de datos alimentada con éxito! 🍕")

if __name__ == "__main__":
    seed_data()