import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MenuComponent } from './components/menu/menu.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // 1. Esta es la entrada principal ahora (Pública)
  { path: '', component: MenuComponent, pathMatch: 'full' }, 
  
  // 2. Otras rutas públicas
  { path: 'menu', component: MenuComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // 3. Ruta protegida de dashboard de admin
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  
  // 4. Ruta protegida (requiere login) - dashboard de usuario
  { path: 'dashboard', component: DashboardComponent },
  
  // 5. Comodín por si escriben cualquier cosa
  { path: '**', redirectTo: '' }
];
