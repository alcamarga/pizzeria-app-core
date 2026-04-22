import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
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
  router = inject(Router);

  // Acceso directo a los items reactivos
  items = this.cartService.items;
  total = this.cartService.totalCarrito;
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
    alert('🚀 Pedido enviado con éxito. ¡En camino a tu mesa!');
    this.cartService.vaciarCarrito();
    this.router.navigate(['/menu']);
  }

  volverAlMenu() {
    this.router.navigate(['/menu']);
  }
}
