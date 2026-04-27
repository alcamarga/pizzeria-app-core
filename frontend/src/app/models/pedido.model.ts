// Interfaces para la gestión de pedidos.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 4.1

export interface ArticuloPedido {
  nombre: string;
  tamano: string;
  cantidad: number;
  precio: number;
}

export interface Pedido {
  id: number;
  usuario_id?: number;
  fecha_hora: string;
  articulos: ArticuloPedido[];
  subtotal: number;
  iva: number;
  total: number;
}

export interface CargaPedido {
  items: ArticuloPedido[];
  total: number;
}
