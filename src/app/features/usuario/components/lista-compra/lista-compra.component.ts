import {Component, EventEmitter, HostListener, Input, OnChanges,Output} from '@angular/core';
import {UsuarioService} from '../../services/usuario.service';
import {NgForOf, NgIf} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ListaCompraDTO, ListaIngredienteDTO} from '../../models/ListaCompraDTO';
import {FormsModule} from '@angular/forms';

/**
 * Componente para mostrar la lista de compra del usuario.
 */
@Component({
  selector: 'app-lista-compra',
  templateUrl: './lista-compra.component.html',
  styleUrls: ['./lista-compra.component.css'],
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    IonicModule,
    FormsModule
  ]
})
export class ListaCompraComponent  implements OnChanges {
  @Input() isOpen = false;
  @Input() cookerId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() solicitarConfirmacionEliminar = new EventEmitter<number>();
  @Output() recetaEliminada = new EventEmitter<void>();


  recetas: ListaCompraDTO[] = [];
  loading = true;
  error = '';

  constructor(private usuarioService: UsuarioService) { }

  /**
   * Método que se ejecuta al detectar cambios en las entradas del componente.
   */
  ngOnChanges() {
    if (this.isOpen && this.cookerId) {
      this.cargarListaCompra();
    } else {
      this.guardarEstado(); // Guardar estado al cerrar
    }
  }

  /**
   * Carga la lista de compra del usuario desde el servicio.
   * Mapea los datos para incluir el estado de los ingredientes (checked).
   */
  private cargarListaCompra() {
    this.loading = true;
    this.usuarioService.ListaCompraByCooker().subscribe({
      next: (data: ListaCompraDTO[]) => {
        const saved = localStorage.getItem(this.getStorageKey());
        const savedState = saved ? JSON.parse(saved) : [];

        this.recetas = data.map(receta => {
          const recetaGuardada = savedState.find((r: ListaCompraDTO) =>
            r.tituloReceta === receta.tituloReceta
          );

          return {
            idReceta: receta.idReceta,
            tituloReceta: receta.tituloReceta,
            ingredientes: receta.ingredientes.map(ingrediente => {
              const ingGuardado = recetaGuardada?.ingredientes.find(
                (i: ListaIngredienteDTO) =>
                  i.nombre === ingrediente.nombre &&
                  i.cantidad === ingrediente.cantidad
              );

              return {
                ...ingrediente,
                checked: ingGuardado?.checked || false
              };
            })
          };
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error cargando la lista de compra';
        this.loading = false;
        console.error(err);
      }
    });
  }


  /**
   * Manjeja el evento de escape para cerrar la lista de compra.
   */
  @HostListener('document:keydown.escape', ['$event'])
  handleEscape() {
    this.isOpen = false;
  }

  /**
   * Metodo que se ejecuta al cerrar el componente.
   */
  onClose() {
    this.guardarEstado(); // Añadir guardado antes de cerrar
    this.close.emit();
    this.isOpen = false;
  }

  private getStorageKey(): string {
    return `lista-compra-checked-${this.cookerId}`;
  }

  /**
   * Guarda el estado de la lista de compra en localStorage.
   */
  guardarEstado() {
    const estado = this.recetas.map(receta => ({
      tituloReceta: receta.tituloReceta,
      ingredientes: receta.ingredientes.map(ing => ({
        nombre: ing.nombre,
        cantidad: ing.cantidad,
        checked: ing.checked
      }))
    }));

    localStorage.setItem(this.getStorageKey(), JSON.stringify(estado));
  }

  /**
   * Marca o desmarca un ingrediente como comprado.
   * @param idReceta
   */
  onSolicitarEliminar(idReceta: number) {
    this.solicitarConfirmacionEliminar.emit(idReceta);
    this.onClose();
  }

  /**
   * Metoodo que se ejecuta al confirmar la eliminación de una receta de la lista de compra.
   */
  eliminarRecetaConfirmada(idReceta: number) {
    this.usuarioService.eliminarRecetaListaCompra(idReceta).subscribe({
      next: () => {
        this.recetas = this.recetas.filter(r => r.idReceta !== idReceta);
        this.guardarEstado();
        this.recetaEliminada.emit();
      },
      error: (err) => {
        console.error(err);
        // Podrías emitir error si quisieras mostrarlo también
      }
    });
  }



}
