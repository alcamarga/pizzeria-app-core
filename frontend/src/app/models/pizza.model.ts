// Modelos para el catálogo de productos y sus precios.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 4.1

export interface VariantePrecio {
  tamano: string;
  precio: number;
}

export interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  variantes: VariantePrecio[];
  imagen?: string;
  activo: boolean;
}
