// Modelos para el catálogo de productos y sus precios.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 4.2

export interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_1?: number;
  precio_2?: number;
  precio_3?: number;
  precio?: number;
  cantidad?: number;
  imagen?: string;
  activo?: boolean;
}
