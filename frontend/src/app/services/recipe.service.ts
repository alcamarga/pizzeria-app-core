import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RecetaItem {
  id?: number;
  pizza_id: number;
  insumo_id: number;
  insumo_nombre?: string;
  cantidad_gastada: number;
  unidad_medida?: string;
}

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pizzas`;

  obtenerReceta(pizzaId: number): Observable<{ receta: RecetaItem[] }> {
    return this.http.get<{ receta: RecetaItem[] }>(`${this.apiUrl}/${pizzaId}/receta`);
  }

  guardarReceta(pizzaId: number, receta: RecetaItem[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/${pizzaId}/receta`, receta);
  }
}
