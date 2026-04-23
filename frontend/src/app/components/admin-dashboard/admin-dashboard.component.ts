import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InventarioComponent } from './inventario/inventario';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { GestionPedidosComponent } from './gestion-pedidos/gestion-pedidos.component';
import { ConfiguracionRecetasComponent } from './configuracion-recetas/configuracion-recetas.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, InventarioComponent, DashboardComponent, GestionPedidosComponent, ConfiguracionRecetasComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  ventasDelDia: number = 0;
  pedidosPendientes: number = 0;
  inventarioPizzas: number = 0;
  pestanaActiva: string = 'menu'; // 'menu', 'insumos', 'pedidos' o 'recetas'

  constructor(private auth: AuthService) {
    // Mock data; replace with real service calls
    this.ventasDelDia = 12450;
    this.pedidosPendientes = 23;
    this.inventarioPizzas = 150;
  }

  cambiarPestana(pestana: string) {
    this.pestanaActiva = pestana;
  }
}
