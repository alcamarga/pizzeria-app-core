import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { PizzaService } from '../../services/pizza.service';
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
  private readonly pizzaService = inject(PizzaService);

  // Variables de estado
  listaPizzas: Pizza[] = [];
  
  cargandoInventario = true;
  errorInventario: string | null = null;

  ngOnInit(): void {
    // 1. Verificación de seguridad inmediata
    if (!this.auth.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }

    // 2. Cargar el inventario de pizzas
    this.cargarInventario();
  }

  // Carga el catálogo de pizzas (Inventario)
  private cargarInventario(): void {
    this.cargandoInventario = true;
    this.pizzaService.obtenerCatalogoPizzas().subscribe({
      next: (pizzas: Pizza[]) => {
        this.listaPizzas = pizzas;
        this.cargandoInventario = false;
      },
      error: (err) => {
        console.error('Error al cargar inventario:', err);
        this.errorInventario = 'Error al cargar el inventario. Inténtalo de nuevo.';
        this.cargandoInventario = false;
      }
    });
  }

  // Función para eliminar (conectada al botón🗑️ del HTML)
  eliminarPizza(id: number): void {
    if (confirm('¿Realmente deseas eliminar esta pizza del inventario?')) {
      // Eliminar de la lista local para actualización inmediata
      this.listaPizzas = this.listaPizzas.filter(pizza => pizza.id !== id);
      this.pizzaService.eliminarPizza(id).subscribe({
        next: () => {
          alert('Pizza eliminada correctamente');
        },
        error: () => {
          alert('Error al eliminar. La pizza ha sido quitada de la vista pero podría seguir existiendo en el servidor. Por favor, verifique.');
        }
      });
    }
  }

  // Función para editar (conectada al botón ✏️ del HTML)
  editarPizza(id: number): void {
    alert('Abriendo edición para la pizza ID: ' + id);
  }

  // Función para volver al menú público
  volverAlMenu(): void {
    this.router.navigate(['/menu']);
  }

  // Función para cerrar sesión con redirección limpia
  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/menu']);
  }
}
