// Servicio para gestionar el catálogo y los pedidos.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 4.1

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Pizza } from '../models/pizza.model';
import { Pedido, CargaPedido } from '../models/pedido.model';
import { environment } from '../../environments/environment';

const URL_API_PIZZAS: string = `${environment.apiUrl}/pizzas`;
const URL_API_PEDIDOS: string = `${environment.apiUrl}/pedidos`;
const URL_API_MIS_PEDIDOS: string = `${environment.apiUrl}/pedidos/mis`;

interface RespuestaPizzas {
  pizzas: Pizza[];
}

interface RespuestaPedidos {
  pedidos: Pedido[];
  total_pedidos: number;
}

interface RespuestaEnvioPedido {
  status: string;
  id_pedido: number;
}

@Injectable({ providedIn: 'root' })
export class PizzaService {
  private http = inject(HttpClient);

  // Obtener catálogo completo de pizzas | Get full pizza catalog
  obtenerCatalogoPizzas(): Observable<Pizza[]> {
    return this.http.get<RespuestaPizzas>(URL_API_PIZZAS).pipe(
      map((respuesta: RespuestaPizzas) => respuesta.pizzas)
    );
  }

  // Enviar nuevo pedido a la base de datos | Send new order to database
  enviarPedido(carga: CargaPedido): Observable<RespuestaEnvioPedido> {
    return this.http.post<RespuestaEnvioPedido>(URL_API_PEDIDOS, carga);
  }

  // Panel admin: todos los pedidos (requiere JWT con rol admin) | Admin panel: all orders (requires JWT with admin role)
  obtenerTodosLosPedidos(): Observable<Pedido[]> {
    return this.http.get<RespuestaPedidos>(URL_API_PEDIDOS).pipe(
      map((respuesta: RespuestaPedidos) => respuesta.pedidos)
    );
  }

  // Historial del usuario autenticado | Authenticated user's order history
  obtenerMisPedidos(): Observable<Pedido[]> {
    return this.http.get<RespuestaPedidos>(URL_API_MIS_PEDIDOS).pipe(
      map((respuesta: RespuestaPedidos) => respuesta.pedidos)
    );
  }
}
