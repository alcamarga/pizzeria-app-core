import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos cómo es un Insumo para que Angular no se confunda
export interface Insumo {
  id: number;
  nombre: string;
  cantidad_actual: number;
  unidad_medida: string;
  stock_minimo: number;
}

@Injectable({
  providedIn: 'root'
})
export class InsumosService {
  private apiUrl = 'http://127.0.0.1:5000/api/insumos';

  constructor(private http: HttpClient) { }

  // Obtener todos los insumos
  getInsumos(): Observable<Insumo[]> {
    return this.http.get<Insumo[]>(this.apiUrl);
  }

  // Actualizar la cantidad de un insumo (cuando llegue pedido o se gaste)
  updateInsumo(id: number, cantidad: number): Observable<Insumo> {
    return this.http.put<Insumo>(`${this.apiUrl}/${id}`, { cantidad_actual: cantidad });
  }

  // Crear un nuevo insumo
  createInsumo(insumo: any): Observable<Insumo> {
    return this.http.post<Insumo>(this.apiUrl, insumo);
  }

  // Eliminar insumo
  deleteInsumo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
