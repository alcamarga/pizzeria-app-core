// Servicio compartido para el estado del carrito usando Signals.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 1.0

import { Injectable, computed, signal } from '@angular/core';
import { Pizza } from '../models/pizza.model';

export interface ArticuloCarrito {
  pizzaId: number;
  tamanoId: number;
  cantidad: number;
  precioUnitario: number;
  nombre: string;
  tamano: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // Lista de artículos en el carrito | List of items in cart
  listaArticulos = signal<ArticuloCarrito[]>([]);

  // Total de artículos (cantidad acumulada) | Total items (accumulated quantity)
  totalArticulos = computed(() =>
    this.listaArticulos().reduce((acc, a) => acc + a.cantidad, 0)
  );

  // Precio total del carrito | Cart total price
  totalCarrito = computed(() =>
    this.listaArticulos().reduce((acc, a) => acc + a.precioUnitario * a.cantidad, 0)
  );

  // Agregar una pizza al carrito | Add a pizza to cart
  agregarAlCarrito(pizza: Pizza, tamanoIndice: number): void {
    const variante = pizza.variantes[tamanoIndice];
    const nuevoArticulo: ArticuloCarrito = {
      pizzaId: pizza.id,
      tamanoId: tamanoIndice,
      cantidad: 1,
      precioUnitario: variante.precio,
      nombre: pizza.nombre,
      tamano: variante.tamano
    };
    this.listaArticulos.update(actual => [...actual, nuevoArticulo]);
  }

  // Quitar un artículo del carrito | Remove an item from cart
  quitarArticulo(indice: number): void {
    this.listaArticulos.update(actual => actual.filter((_, i) => i !== indice));
  }

  // Aumentar cantidad de un artículo | Increase item quantity
  aumentarCantidad(indice: number): void {
    this.listaArticulos.update(actual =>
      actual.map((item, i) =>
        i === indice ? { ...item, cantidad: item.cantidad + 1 } : item
      )
    );
  }

  // Disminuir cantidad de un artículo | Decrease item quantity
  disminuirCantidad(indice: number): void {
    this.listaArticulos.update(actual =>
      actual
        .map((item, i) =>
          i === indice ? { ...item, cantidad: item.cantidad - 1 } : item
        )
        .filter(item => item.cantidad > 0)
    );
  }

  // Vaciar el carrito | Empty cart
  vaciarCarrito(): void {
    this.listaArticulos.set([]);
  }
}
