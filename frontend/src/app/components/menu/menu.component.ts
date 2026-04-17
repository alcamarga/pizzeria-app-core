// Componente Menu para mostrar el catálogo de pizzas de forma pública.
// Autor: Camilo Martinez
// Fecha: 15/04/2026
// Estética: Crema/Dorado con transparencia y bordes redondeados

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PizzaService } from '../../services/pizza.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Pizza } from '../../models/pizza.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  pizzaService = inject(PizzaService);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  cartService = inject(CartService);

  // Catálogo de pizzas | Pizza catalog
  pizzas = signal<Pizza[]>([]);

  // Estado de carga | Loading state
  cargando = signal(true);
  error = signal<string | null>(null);

  // Estado de autenticación | Authentication state
  estaAutenticado = computed(() => this.auth.estaAutenticado());
  usuarioActual = this.auth.obtenerUsuarioActual();

  // Mensaje de confirmación | Confirmation message
  mensajeExito = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMenu();
    // Manejar intención de compra post-login
    this.manejarIntencionCompra();
  }

  // Manejar query params de intención de compra después de login
  private manejarIntencionCompra(): void {
    this.route.queryParams.subscribe(params => {
      const pizzaId = params['agregar'];
      const tamanoIndice = params['tamano'];

      if (pizzaId && tamanoIndice !== undefined && this.estaAutenticado()) {
        const pizza = this.pizzas().find(p => p.id === Number(pizzaId));
        if (pizza) {
          this.cartService.agregarAlCarrito(pizza, Number(tamanoIndice));
          this.mensajeExito.set('¡Pizza agregada al carrito! 🎉');
          // Limpiar URL sin recargar
          this.router.navigate(['/menu'], { replaceUrl: true });
          // Ocultar mensaje después de 3 segundos
          setTimeout(() => this.mensajeExito.set(null), 3000);
        }
      }
    });
  }

  cargarMenu(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.pizzaService.obtenerCatalogoPizzas().subscribe({
      next: (pizzas) => {
        this.pizzas.set(pizzas.filter(p => p.activo));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set('No se pudo cargar el menú. Intenta de nuevo más tarde.');
        console.error('Error al cargar pizzas:', err);
      }
    });
  }

  // Manejar clic en "Agregar al Carrito"
  agregarAlCarrito(pizza: Pizza, tamanoIndice: number): void {
    if (!this.estaAutenticado()) {
      // Si no está logueado, guardamos la intención y mandamos al login
      // Esto es lo que querías: "si da agregar, pida loguear"
      this.router.navigate(['/login']);
      return;
    }

    // Si ya está autenticado, agregamos al carrito
    this.cartService.agregarAlCarrito(pizza, tamanoIndice);
    this.mensajeExito.set(`¡${pizza.nombre} agregada! 🎉`);
    setTimeout(() => this.mensajeExito.set(null), 3000);
  }

  // Navegar a login | Navigate to login
  irALogin(): void {
    this.router.navigate(['/login']);
  }
}
