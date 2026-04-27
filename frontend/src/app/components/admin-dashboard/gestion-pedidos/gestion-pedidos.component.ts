import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, Pedido } from '../../../services/order.service';
import { FormsModule } from '@angular/forms';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-gestion-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-pedidos.component.html',
  styleUrls: ['./gestion-pedidos.component.css']
})
export class GestionPedidosComponent implements OnInit {
  private orderService = inject(OrderService);
  pedidos: Pedido[] = [];
  cargando = true;
  
  // Sistema de Toast | Toast system
  mostrarToast = signal(false);
  mensajeToast = signal('');

  estadosDisponibles = ['Pendiente', 'Preparando', 'Enviado', 'Entregado', 'Cancelado'];

  private authService = inject(AuthService);

  ngOnInit(): void {
    // Sincronización de Carga: Solo disparar si hay sesión activa
    this.authService.sesionActiva$.subscribe(sesion => {
      if (sesion) {
        console.log('[GestionPedidos] Sesión detectada, cargando pedidos...');
        this.cargarTodosLosPedidos();
      } else {
        console.warn('[GestionPedidos] Esperando sesión activa para cargar datos.');
      }
    });
  }

  cargarTodosLosPedidos(): void {
    this.orderService.obtenerPedidos().subscribe({
      next: (res) => {
        this.pedidos = res.pedidos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar todos los pedidos:', err);
        this.cargando = false;
      }
    });
  }

  cambiarEstado(pedidoId: number, nuevoEstado: string): void {
    this.orderService.actualizarEstado(pedidoId, nuevoEstado).pipe(
      catchError(err => {
        console.error('Error al actualizar estado:', err);
        this.lanzarToast('❌ Error al actualizar el estado');
        return throwError(() => err);
      })
    ).subscribe({
      next: () => {
        this.lanzarToast(`✅ Estado actualizado: ${nuevoEstado}`);
      }
    });
  }

  private lanzarToast(mensaje: string): void {
    this.mensajeToast.set(mensaje);
    this.mostrarToast.set(true);
    setTimeout(() => this.mostrarToast.set(false), 3000);
  }
}
