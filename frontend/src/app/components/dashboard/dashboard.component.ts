import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ApiHealthService } from '../../services/api-health.service';
import { PizzaService } from '../../services/pizza.service';
import { AuthService } from '../../services/auth.service';
import { EstadoApiSalud } from '../../models/estado-api-salud.model';
import { Pedido } from '../../models/pedido.model';
import { Pizza } from '../../models/pizza.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Inyecciones públicas para que el HTML pueda acceder a ellas sin errores TS2341
  public readonly auth = inject(AuthService);
  public readonly router = inject(Router);
  private readonly apiHealth = inject(ApiHealthService);
  private readonly pizzaService = inject(PizzaService);

  // Variables de estado
  listaPedidos: Pedido[] = [];
  listaPizzas: Pizza[] = [];
  
  cargandoApi = true;
  errorApi: string | null = null;
  saludApi: EstadoApiSalud | null = null;

  cargandoPedidos = true;
  usuarioActual = this.auth.obtenerUsuarioActual();

  ngOnInit(): void {
    // 1. Verificación de seguridad inmediata
    if (!this.auth.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Revisar salud del Backend y cargar datos
    this.apiHealth.obtenerSalud().subscribe({
      next: (cuerpo) => {
        this.saludApi = cuerpo;
        this.cargandoApi = false;
        
        // Si el backend está vivo, traemos la info
        this.cargarPedidos();
        this.cargarInventario();
      },
      error: () => {
        this.cargandoApi = false;
        this.errorApi = 'No hay conexión con el servidor.';
      },
    });
  }

  // Carga la lista de pedidos realizados
  private cargarPedidos(): void {
    this.cargandoPedidos = true;
    this.pizzaService.obtenerTodosLosPedidos().subscribe({
      next: (pedidos) => {
        this.listaPedidos = pedidos;
        this.cargandoPedidos = false;
      },
      error: () => {
        this.cargandoPedidos = false;
        this.listaPedidos = [];
      },
    });
  }

  // Carga el catálogo de pizzas (Inventario)
  private cargarInventario(): void {
    this.pizzaService.obtenerCatalogoPizzas().subscribe({
      next: (pizzas: Pizza[]) => {
        this.listaPizzas = pizzas;
      },
      error: (err) => console.error('Error al cargar inventario:', err)
    });
  }

  // Función para eliminar (conectada al botón🗑️ del HTML)
  eliminarPizza(id: number): void {
    if (confirm('¿Realmente deseas eliminar esta pizza del inventario?')) {
      this.pizzaService.eliminarPizza(id).subscribe({
        next: () => {
          alert('Pizza eliminada correctamente');
          this.cargarInventario(); // Refrescamos la lista automáticamente
        },
        error: () => alert('Error al eliminar. Inténtalo de nuevo.')
      });
    }
  }

  // Función para editar (conectada al botón ✏️ del HTML)
  editarPizza(id: number): void {
    console.log('Navegando a edición de pizza:', id);
    // Aquí podrías navegar a un formulario de edición:
    // this.router.navigate(['/admin/editar', id]);
  }

  // Función para cerrar sesión con redirección limpia
  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/menu']);
  }
}