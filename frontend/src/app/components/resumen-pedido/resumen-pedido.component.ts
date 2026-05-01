import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resumen-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-pedido.component.html',
  styleUrls: ['./resumen-pedido.component.css']
})
export class ResumenPedidoComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);

  // Acceso directo a los items reactivos
  items = this.cartService.items;
  total = this.cartService.totalCarrito;
  iva = this.cartService.ivaCarrito;
  totalConIva = this.cartService.totalConIva;
  totalItems = this.cartService.totalArticulos;

  aumentar(idx: number) {
    this.cartService.aumentarCantidad(idx);
  }

  disminuir(idx: number) {
    this.cartService.disminuirCantidad(idx);
  }

  eliminar(idx: number) {
    this.cartService.quitarArticulo(idx);
  }

  cancelarPedido() {
    if (confirm('¿Estás seguro de que deseas cancelar el pedido y vaciar el carrito?')) {
      this.cartService.vaciarCarrito();
    }
  }

  confirmarPedido() {
    const usuario = this.authService.obtenerUsuarioActual();
    
    if (!usuario) {
      alert('Debes iniciar sesión para confirmar el pedido.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.items().length === 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    this.cartService.confirmarPedido(usuario.id).subscribe({
      next: (res: any) => {
        alert('✅ ¡Pedido recibido con éxito! Pronto estará en tu mesa.');
        this.cartService.vaciarCarrito();
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        console.error('Error al confirmar pedido:', err);
        alert('❌ Hubo un problema al procesar tu pedido. Por favor, intenta de nuevo.');
      }
    });
  }

  volverAlMenu() {
    this.router.navigate(['/menu']);
  }
}
