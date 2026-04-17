import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  ventasDelDia: number = 0;
  pedidosPendientes: number = 0;
  inventarioPizzas: number = 0;

  constructor(private auth: AuthService) {
    // Mock data; replace with real service calls
    this.ventasDelDia = 12450;
    this.pedidosPendientes = 23;
    this.inventarioPizzas = 150;
  }
}
