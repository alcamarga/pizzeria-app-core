// Servicio de autenticación JWT con persistencia en localStorage.
// Autor: Camilo Martinez | Fecha: 23/03/2026 | Versión: 4.1

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import {
  Usuario,
  LoginCargaUtil,
  RegistroCargaUtil,
  RespuestaAutenticacion,
  SesionActiva
} from '../models/usuario.model';
import { environment } from '../../environments/environment';

const CLAVE_TOKEN: string = 'access_token';
const CLAVE_USUARIO: string = 'usuario';
const URL_API_AUTENTICACION: string = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Estado reactivo de la sesión | Reactive session state
  private _sesion$: BehaviorSubject<SesionActiva | null> =
    new BehaviorSubject<SesionActiva | null>(this.cargarSesionGuardada());

  readonly sesionActiva$: Observable<SesionActiva | null> = this._sesion$.asObservable();

  estaAutenticado(): boolean {
    return this._sesion$.getValue() !== null;
  }

  obtenerUsuarioActual(): Usuario | null {
    const usuario = this._sesion$.getValue()?.usuario ?? null;
    if (usuario) {
      console.log('[AuthService] Usuario actual:', usuario.email, 'Rol:', usuario.rol);
    } else {
      console.warn('[AuthService] No hay usuario en sesión actual');
    }
    return usuario;
  }

  obtenerTokenAcceso(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  iniciarSesion(credenciales: LoginCargaUtil): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${URL_API_AUTENTICACION}/login`, credenciales).pipe(
      tap((respuesta: RespuestaAutenticacion) => this.registrarSesionLocal(respuesta))
    );
  }

  registrarUsuario(datos: RegistroCargaUtil): Observable<RespuestaAutenticacion> {
    return this.http.post<RespuestaAutenticacion>(`${URL_API_AUTENTICACION}/registro`, datos).pipe(
      tap((respuesta: RespuestaAutenticacion) => this.registrarSesionLocal(respuesta))
    );
  }

  limpiarSesion(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this._sesion$.next(null);
    console.log('[AuthService] Sesión limpiada localmente');
  }

  cerrarSesion(): void {
    this.limpiarSesion();
    location.reload();
  }

  private registrarSesionLocal(respuesta: RespuestaAutenticacion): void {
    console.log('[DEBUG] Respuesta completa del servidor:', JSON.stringify(respuesta, null, 2));
    
    // MEDIDA QUIRÚRGICA: Forzar persistencia inmediata
    localStorage.setItem(CLAVE_TOKEN, respuesta.access_token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario));
    localStorage.setItem('user_role', 'admin'); // Forzado como pediste

    const nuevaSesion: SesionActiva = {
      usuario: respuesta.usuario,
      accessToken: respuesta.access_token
    };
    console.log('[AuthService] Nueva sesión registrada (Forzada):', nuevaSesion.usuario.email, 'Rol:', nuevaSesion.usuario.rol);
    this._sesion$.next(nuevaSesion);
  }

  private cargarSesionGuardada(): SesionActiva | null {
    const token: string | null = localStorage.getItem(CLAVE_TOKEN);
    const usuarioCrudo: string | null = localStorage.getItem(CLAVE_USUARIO);

    if (!token || !usuarioCrudo) return null;

    try {
      const usuario: Usuario = JSON.parse(usuarioCrudo) as Usuario;
      return { usuario, accessToken: token };
    } catch {
      this.limpiarSesion();
      return null;
    }
  }

  // Verifica si el usuario actual tiene rol de administrador
  isAdmin(): boolean {
    const usuario = this.obtenerUsuarioActual();
    return !!(usuario && usuario.rol === 'admin');
  }
}
