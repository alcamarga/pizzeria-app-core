// Componente Dashboard para mostrar pedidos activos.
// Autor: Camilo Martinez
// Fecha: 15/04/2026

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiHealthService } from '../../services/api-health.service';
import { PizzaService } from '../../services/pizza.service';
import { AuthService } from '../../services/auth.service';
import { EstadoApiSalud } from '../../models/estado-api-salud.model';
import { Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private readonly apiHealth = inject(ApiHealthService);
  private readonly pizzaService = inject(PizzaService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Pedidos cargados desde la API | Orders loaded from API
  listaPedidos: Pedido[] = [];

  // Estado de la verificación HttpClient → backend | HttpClient → backend check state
  cargandoApi = true;
  errorApi: string | null = null;
  saludApi: EstadoApiSalud | null = null;

  // Estado de carga de pedidos | Orders loading state
  cargandoPedidos = true;
  errorPedidos: string | null = null;

  // Usuario actual | Current user
  usuarioActual = this.auth.obtenerUsuarioActual();

  ngOnInit(): void {
    // Verificar si hay sesión activa, si no, redirigir a login
    // Check if there's an active session, if not redirect to login
    if (!this.auth.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    // Verificar salud del API | Check API health
    this.apiHealth.obtenerSalud().subscribe({
      next: (cuerpo) => {
        this.saludApi = cuerpo;
        this.cargandoApi = false;
        this.errorApi = null;
        // Si el API está saludable, cargar pedidos
        if (this.saludApi?.status === 'ok') {
          this.cargarPedidos();
        }
      },
      error: () => {
        this.cargandoApi = false;
        this.saludApi = null;
        // Mensaje visible si el proxy o Flask no responden | Shown when proxy or Flask is down
        this.errorApi =
          'No hay respuesta del backend. Activa Flask en el puerto 5000 y reinicia ng serve con proxy.';
      },
    });
  }

  // Cargar pedidos desde el API
  // Load orders from API
  private cargarPedidos(): void {
    this.cargandoPedidos = true;
    this.pizzaService.obtenerTodosLosPedidos().subscribe({
      next: (pedidos) => {
        this.listaPedidos = pedidos;
        this.cargandoPedidos = false;
      },
      error: (err) => {
        this.cargandoPedidos = false;
        if (err.status === 401) {
          this.errorPedidos = 'Se requiere autenticación para ver los pedidos.';
          this.auth.cerrarSesion();
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.errorPedidos = 'Se requiere rol de administrador.';
        } else {
          this.errorPedidos = 'No hay pedidos registrados aún.';
        }
        this.listaPedidos = [];
      },
    });
  }

  // Cerrar sesión | Logout
  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
