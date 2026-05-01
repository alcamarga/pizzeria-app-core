// Inventario de Insumos — Admin Dashboard
// Autor: Camilo Martinez | Fecha: 01/05/2026

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsumosService, Insumo, InsumoPayload } from '../../../services/insumos';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class InventarioComponent implements OnInit {
  insumos = signal<Insumo[]>([]);
  cargando = signal(false);
  mensajeExito = signal<string | null>(null);
  mensajeError = signal<string | null>(null);

  // --- Edición inline ---
  editandoId: number | null = null;
  edicion: Partial<InsumoPayload> = {};

  // --- Formulario nuevo insumo ---
  mostrarFormulario = false;
  nuevoInsumo: InsumoPayload = this.insumoVacio();

  unidades = ['gr', 'ml', 'kg', 'lt', 'uds'];

  constructor(private insumosService: InsumosService) {}

  ngOnInit(): void {
    this.obtenerInsumos();
  }

  obtenerInsumos(): void {
    this.cargando.set(true);
    this.insumosService.getInsumos().subscribe({
      next: (data) => {
        this.insumos.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        this.mostrarError('Error al cargar insumos: ' + (err.error?.error || err.message));
        this.cargando.set(false);
      }
    });
  }

  // --- Edición inline ---

  iniciarEdicion(insumo: Insumo): void {
    this.editandoId = insumo.id;
    this.edicion = {
      cantidad: insumo.cantidad,
      precio_unidad: insumo.precio_unidad,
      stock_minimo: insumo.stock_minimo ?? 0,
    };
  }

  guardarEdicion(id: number): void {
    this.insumosService.updateInsumo(id, this.edicion).subscribe({
      next: (actualizado) => {
        this.insumos.update(lista =>
          lista.map(i => i.id === id ? { ...i, ...actualizado } : i)
        );
        this.editandoId = null;
        this.mostrarExito('✅ Insumo actualizado');
      },
      error: (err) => this.mostrarError('❌ ' + (err.error?.error || 'Error al guardar'))
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.edicion = {};
  }

  // --- Nuevo insumo ---

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) this.nuevoInsumo = this.insumoVacio();
  }

  agregarInsumo(): void {
    if (!this.nuevoInsumo.nombre.trim()) {
      this.mostrarError('El nombre es obligatorio');
      return;
    }
    this.insumosService.createInsumo(this.nuevoInsumo).subscribe({
      next: (creado) => {
        this.insumos.update(lista => [...lista, creado]);
        this.nuevoInsumo = this.insumoVacio();
        this.mostrarFormulario = false;
        this.mostrarExito('✅ Insumo registrado');
      },
      error: (err) => this.mostrarError('❌ ' + (err.error?.error || 'Error al crear'))
    });
  }

  // --- Eliminar ---

  eliminarInsumo(id: number): void {
    if (!confirm('¿Eliminar este insumo permanentemente?')) return;
    this.insumosService.deleteInsumo(id).subscribe({
      next: () => {
        this.insumos.update(lista => lista.filter(i => i.id !== id));
        this.mostrarExito('🗑️ Insumo eliminado');
      },
      error: (err) => this.mostrarError('❌ ' + (err.error?.error || 'Error al eliminar'))
    });
  }

  // --- Helpers ---

  estadoStock(insumo: Insumo): 'bajo' | 'optimo' {
    return insumo.cantidad < (insumo.stock_minimo ?? 0) ? 'bajo' : 'optimo';
  }

  private insumoVacio(): InsumoPayload {
    return { nombre: '', cantidad: 0, precio_unidad: 0, unidad_medida: 'gr', stock_minimo: 0 };
  }

  private mostrarExito(msg: string): void {
    this.mensajeExito.set(msg);
    this.mensajeError.set(null);
    setTimeout(() => this.mensajeExito.set(null), 3500);
  }

  private mostrarError(msg: string): void {
    this.mensajeError.set(msg);
    this.mensajeExito.set(null);
    setTimeout(() => this.mensajeError.set(null), 5000);
  }
}
