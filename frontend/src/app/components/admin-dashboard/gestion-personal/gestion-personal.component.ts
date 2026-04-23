import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserStaff } from '../../../services/user.service';

@Component({
  selector: 'app-gestion-personal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-personal.component.html',
  styleUrls: ['./gestion-personal.component.css']
})
export class GestionPersonalComponent implements OnInit {
  private userService = inject(UserService);
  
  personal = signal<UserStaff[]>([]);
  nuevoUsuario: UserStaff = { nombre: '', email: '', rol: 'cocinero', password: '' };
  editandoId: number | null = null;
  mostrarFormulario = false;
  rolesDisponibles = ['admin', 'cocinero', 'domiciliario'];

  ngOnInit(): void {
    this.cargarPersonal();
  }

  cargarPersonal(): void {
    this.userService.obtenerPersonal().subscribe(res => {
      this.personal.set(res.usuarios);
    });
  }

  abrirModalNuevo(): void {
    this.editandoId = null;
    this.nuevoUsuario = { nombre: '', email: '', rol: 'cocinero', password: '' };
    this.mostrarFormulario = true;
  }

  prepararEdicion(usuario: UserStaff): void {
    this.editandoId = usuario.id!;
    this.nuevoUsuario = { ...usuario, password: '' }; // No mostrar password
    this.mostrarFormulario = true;
  }

  registrarPersonal(): void {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.email) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (this.editandoId) {
      // Actualizar
      this.userService.actualizarPersonal(this.editandoId, this.nuevoUsuario).subscribe({
        next: () => {
          alert('✅ Personal actualizado con éxito');
          this.finalizarAccion();
        },
        error: (err) => alert('❌ Error: ' + (err.error?.error || 'No se pudo actualizar'))
      });
    } else {
      // Crear
      if (!this.nuevoUsuario.password) {
        alert('La contraseña es obligatoria para nuevos registros');
        return;
      }
      this.userService.crearPersonal(this.nuevoUsuario).subscribe({
        next: () => {
          alert('✅ Personal registrado con éxito');
          this.finalizarAccion();
        },
        error: (err) => alert('❌ Error: ' + (err.error?.error || 'No se pudo registrar'))
      });
    }
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de eliminar a este empleado? Esta acción no se puede deshacer.')) {
      this.userService.eliminarPersonal(id).subscribe({
        next: () => {
          alert('🗑️ Usuario eliminado');
          this.cargarPersonal();
        },
        error: (err) => alert('❌ Error: ' + (err.error?.error || 'No se pudo eliminar'))
      });
    }
  }

  private finalizarAccion(): void {
    this.cargarPersonal();
    this.mostrarFormulario = false;
    this.editandoId = null;
    this.nuevoUsuario = { nombre: '', email: '', rol: 'cocinero', password: '' };
  }
}
