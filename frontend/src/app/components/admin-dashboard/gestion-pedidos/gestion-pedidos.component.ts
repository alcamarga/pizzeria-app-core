import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Pedido, ItemPedido } from '../../../services/order.service';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-pedidos.component.html',
  styleUrls: ['./gestion-pedidos.component.css']
})
export class GestionPedidosComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  pedidos: Pedido[] = [];
  cargando = true;

  // Toast
  mostrarToast = signal(false);
  mensajeToast = signal('');

  // Modal detalle
  pedidoDetalle: Pedido | null = null;
  mostrarDetalle = false;

  estadosDisponibles = ['Pendiente', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];

  private authService = inject(AuthService);
  private sub: Subscription | null = null;

  ngOnInit(): void {
    this.sub = this.authService.sesionActiva$.subscribe(sesion => {
      if (sesion) this.cargarTodosLosPedidos();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  cargarTodosLosPedidos(): void {
    this.orderService.obtenerPedidos().subscribe({
      next: (res) => {
        this.pedidos = res.pedidos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.cargando = false;
      }
    });
  }

  cambiarEstado(pedidoId: number, nuevoEstado: string): void {
    this.orderService.actualizarEstado(pedidoId, nuevoEstado).pipe(
      catchError(err => {
        this.lanzarToast('❌ Error al actualizar el estado');
        return throwError(() => err);
      })
    ).subscribe(() => this.lanzarToast(`✅ Estado actualizado: ${nuevoEstado}`));
  }

  verDetalle(pedido: Pedido): void {
    this.pedidoDetalle = pedido;
    this.mostrarDetalle = true;
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.pedidoDetalle = null;
  }

  subtotalPedido(pedido: Pedido): number {
    return Math.round((pedido.total ?? 0) / 1.19);
  }

  ivaPedido(pedido: Pedido): number {
    return Math.round((pedido.total ?? 0) - this.subtotalPedido(pedido));
  }

  private lanzarToast(mensaje: string): void {
    this.mensajeToast.set(mensaje);
    this.mostrarToast.set(true);
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }
}
