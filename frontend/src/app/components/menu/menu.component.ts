import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PizzaService } from '../../services/pizza.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Pizza } from '../../models/pizza.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Control del formulario de nueva pizza
  mostrarFormulario = false;

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  modificarPizza(id: number): void {
    alert('Modificando pizza: ' + id);
  }

  eliminarPizza(id: number): void {
    alert('Eliminando pizza: ' + id);
  }

  // Formulario de nueva pizza
  nuevaPizza = {
    nombre: '',
    descripcion: '',
    precioPersonal: 0,
    precioMediana: 0,
    precioFamiliar: 0
  };

  guardarPizza(): void {
    console.log('Guardando nueva pizza:', this.nuevaPizza);
    
    this.pizzaService.crearPizza(this.nuevaPizza).subscribe({
        next: (res) => {
            console.log('¡Pizza guardada con éxito!', res);
            
            // ✅ CAMBIAMOS EL NOMBRE AQUÍ:
            // Usamos cargarMenu() porque es la que ya tienes definida arriba
            this.cargarMenu(); 

            this.mostrarFormulario = false;
            this.nuevaPizza = { nombre: '', descripcion: '', precioPersonal: 0, precioMediana: 0, precioFamiliar: 0 };
        },
        error: (err) => {
            console.error('Error al guardar la pizza:', err);
            alert('No se pudo guardar la pizza.');
        }
    });
}

  cancelarFormulario(): void {
    this.nuevaPizza = { nombre: '', descripcion: '', precioPersonal: 0, precioMediana: 0, precioFamiliar: 0 };
    this.mostrarFormulario = false;
  }
}
