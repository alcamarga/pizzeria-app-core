import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InventarioComponent } from './inventario/inventario';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { GestionPedidosComponent } from './gestion-pedidos/gestion-pedidos.component';
import { ConfiguracionRecetasComponent } from './configuracion-recetas/configuracion-recetas.component';
import { GestionPersonalComponent } from './gestion-personal/gestion-personal.component';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, InventarioComponent, DashboardComponent, GestionPedidosComponent, ConfiguracionRecetasComponent, GestionPersonalComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  ventasDelDia: number = 0;
  pedidosPendientes: number = 0;
  inventarioPizzas: number = 0;
  pestanaActiva: string = 'pedidos'; // Default para todos los roles
  usuario: Usuario | null = null;

  constructor(private auth: AuthService) {
    this.usuario = this.auth.obtenerUsuarioActual();
    
    // Si es cocinero, forzar pestaña pedidos
    if (this.usuario?.rol === 'cocinero') {
      this.pestanaActiva = 'pedidos';
    }

    // Mock data; replace with real service calls
    this.ventasDelDia = 12450;
    this.pedidosPendientes = 23;
    this.inventarioPizzas = 150;
  }

  cambiarPestana(pestana: string) {
    this.pestanaActiva = pestana;
  }
}
