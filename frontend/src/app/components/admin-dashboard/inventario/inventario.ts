import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService, Insumo } from '../../../services/insumos';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class InventarioComponent implements OnInit {
  // Señal para almacenar la lista de insumos | Signal to store the list of supplies
  insumos = signal<Insumo[]>([]);

  // Variables para edición referencial | Variables for inline editing
  editandoId: number | null = null;
  cantidadEditada: number = 0;

  // Control para nuevo Insumo | Control for new Supply
  nuevoInsumoVisibilidad = false;
  nuevoInsumo: Partial<Insumo> = { nombre: '', cantidad: 0, unidad_medida: 'kg', stock_minimo: 0 };

  constructor(private insumosService: InsumosService) { }

  ngOnInit(): void {
    // Cargar los insumos al iniciar el componente | Load supplies on component init
    this.obtenerInsumos();
  }

  // Obtener la lista de insumos vía el servicio | Fetch the supplies list via service
  obtenerInsumos(): void {
    this.insumosService.getInsumos().subscribe({
      next: (data: Insumo[]) => {
        // Actualizar la señal con la respuesta del servidor | Update signal with server response
        this.insumos.set(data);
      },
      error: (err: any) => {
        // Manejar el error adecuadamente | Handle error properly
        console.error('Error al obtener los insumos:', err);
      }
    });
  }

  // Comienza la edición interactiva de stock | Starts stock interactive editing
  iniciarEdicion(insumo: Insumo): void {
    this.editandoId = insumo.id;
    this.cantidadEditada = insumo.cantidad;
  }

  // Guarda y actualiza la UI via Signal | Saves and updates UI via Signal
  guardarEdicion(id: number): void {
    this.insumosService.updateInsumo(id, this.cantidadEditada).subscribe({
      next: (insumoActualizado) => {
        // Refresco automático actualizando el arreglo del Signal | Auto-refresh updating Signal array
        this.insumos.update(actuales =>
          actuales.map(i => i.id === id ? { ...i, cantidad: insumoActualizado.cantidad } : i)
        );
        this.editandoId = null;
      },
      error: (err) => {
        console.error('Error al actualizar insumo:', err);
        alert('Error guardando cambios');
      }
    });
  }

  // Cancela la edición | Cancels editing
  cancelarEdicion(): void {
    this.editandoId = null;
  }

  // --- MÉTODOS PARA AGREGAR Y ELIMINAR ---
  toggleNuevoInsumo(): void {
    this.nuevoInsumoVisibilidad = !this.nuevoInsumoVisibilidad;
  }

  agregarInsumo(): void {
    if (!this.nuevoInsumo.nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    this.insumosService.createInsumo(this.nuevoInsumo).subscribe({
      next: (creado) => {
        // Añade al Signal actual | Append to current Signal
        this.insumos.update(actuales => [...actuales, creado]);
        this.nuevoInsumo = { nombre: '', cantidad: 0, unidad_medida: 'kg', stock_minimo: 0 };
        this.nuevoInsumoVisibilidad = false;
      },
      error: (err) => {
        console.error('Error al agregar insumo:', err);
        alert('Hubo un error al crear el insumo.');
      }
    });
  }

  eliminarInsumo(id: number): void {
    if (confirm('¿Estás seguro de eliminar este insumo permanentemente de la base de datos?')) {
      this.insumosService.deleteInsumo(id).subscribe({
        next: () => {
          this.insumos.update(actuales => actuales.filter(i => i.id !== id));
        },
        error: (err) => {
          console.error('Error al eliminar insumo:', err);
          alert('Error al intentar eliminar.');
        }
      });
    }
  }
}
