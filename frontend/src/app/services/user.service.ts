import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserStaff {
  id?: number;
  nombre: string;
  email: string;
  rol: string;
  password?: string;
  fecha_registro?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  obtenerPersonal(): Observable<{ usuarios: UserStaff[] }> {
    return this.http.get<{ usuarios: UserStaff[] }>(this.apiUrl);
  }

  crearPersonal(usuario: UserStaff): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  actualizarPersonal(id: number, usuario: UserStaff): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarPersonal(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
