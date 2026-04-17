import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MenuComponent } from './components/menu/menu.component';

export const routes: Routes = [
  // 1. Esta es la entrada principal ahora (Pública)
  { path: '', component: MenuComponent, pathMatch: 'full' }, 
  
  // 2. Otras rutas públicas
  { path: 'menu', component: MenuComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // 3. Ruta protegida (requiere login)
  { path: 'dashboard', component: DashboardComponent },
  
  // 4. Comodín por si escriben cualquier cosa
  { path: '**', redirectTo: '' }
];
