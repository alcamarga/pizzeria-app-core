import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface sincronizada con el Backend (Flask/PostgreSQL)
 * Nota: Se cambió 'cantidad_actual' por 'cantidad' para coincidir con el JSON del servidor.
 */
export interface Insumo {
  id: number;
  nombre: string;
  cantidad: number; // Coincide con el JSON que vimos en el navegador
  precio: number;   // Agregado para mostrar el precio en el inventario
  unidad_medida?: string; // Opcional por ahora si no viene en el JSON de pizzas
  stock_minimo?: number;  // Opcional
}

@Injectable({
  providedIn: 'root'
})
export class InsumosService {
  private apiUrl = 'http://127.0.0.1:5000/api/insumos';

  constructor(private http: HttpClient) { }

  /**
   * Obtener todos los productos (pizzas/insumos)
   */
  getInsumos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(this.apiUrl);
  }

  /**
   * Actualizar el stock
   */
  updateInsumo(id: number, cantidad: number): Observable<Insumo> {
    // Se envía 'cantidad' en el body para mantener consistencia con el backend
    return this.http.put<Insumo>(`${this.apiUrl}/${id}`, { cantidad: cantidad });
  }

  /**
   * Crear un nuevo registro
   */
  createInsumo(insumo: any): Observable<Insumo> {
    return this.http.post<Insumo>(this.apiUrl, insumo);
  }

  /**
   * Eliminar registro permanentemente
   */
  deleteInsumo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}