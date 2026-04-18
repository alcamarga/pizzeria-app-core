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

  pizzas = signal<Pizza[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  estaAutenticado = computed(() => this.auth.estaAutenticado());
  usuarioActual = this.auth.obtenerUsuarioActual();
  mensajeExito = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarMenu();
    this.manejarIntencionCompra();
  }

  private manejarIntencionCompra(): void {
    this.route.queryParams.subscribe(params => {
      const pizzaId = params['agregar'];
      const tamanoIndice = params['tamano'];
      if (pizzaId && tamanoIndice !== undefined && this.estaAutenticado()) {
        const pizza = this.pizzas().find(p => p.id === Number(pizzaId));
        if (pizza) {
          this.cartService.agregarAlCarrito(pizza, Number(tamanoIndice));
          this.mensajeExito.set('¡Pizza agregada al carrito! 🎉');
          this.router.navigate(['/menu'], { replaceUrl: true });
          setTimeout(() => this.mensajeExito.set(null), 3000);
        }
      }
    });
  }

  cargarMenu(): void {
    this.cargando.set(true);
    this.pizzaService.obtenerCatalogoPizzas().subscribe({
      next: (pizzas) => {
        this.pizzas.set(pizzas.filter(p => p.activo));
        this.cargando.set(false);
      },
      error: (err) => {
        this.cargando.set(false);
        this.error.set('Error al cargar el menú.');
      }
    });
  }

  agregarAlCarrito(pizza: Pizza, tamanoIndice: number): void {
    if (!this.estaAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }
    this.cartService.agregarAlCarrito(pizza, tamanoIndice);
    this.mensajeExito.set(`¡${pizza.nombre} agregada! 🎉`);
    setTimeout(() => this.mensajeExito.set(null), 3000);
  }

  // --- NUEVAS FUNCIONES PARA EL ADMIN ---
  irAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  editarPizza(id: number) {
    const pizza = this.pizzas().find(p => p.id === id);
    const nombre = pizza ? pizza.nombre : 'desconocida';
    alert('Editando detalles de: ' + nombre);
  }

  eliminarPizza(id: number) {
    if(confirm('¿Estás seguro de eliminar esta pizza?')) {
      console.log('Eliminando pizza:', id);
      // Aquí puedes filtrar el signal para que desaparezca de la vista
      this.pizzas.set(this.pizzas().filter(p => p.id !== id));
    }
  }
}
