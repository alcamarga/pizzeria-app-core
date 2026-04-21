// Modelos para el catálogo de productos y sus precios.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 4.2

export interface Pizza {
  id: number;
  nombre: string;
  descripcion: string;
  precio_p: number; // Precio Personal | Personal Price
  precio_m: number; // Precio Mediana | Medium Price
  precio_g: number; // Precio Familiar | Family Price
  imagen?: string;
  activo: boolean;
}
