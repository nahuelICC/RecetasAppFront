import {Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output} from '@angular/core';
import {UsuarioService} from '../../services/usuario.service';
import {NgForOf, NgIf} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {ListaCompraDTO, ListaIngredienteDTO} from '../../models/ListaCompraDTO';
import {FormsModule} from '@angular/forms';

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

  ngOnChanges() {
    if (this.isOpen && this.cookerId) {
      this.cargarListaCompra();
    } else {
      this.guardarEstado(); // Guardar estado al cerrar
    }
  }
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

  // toggleIngrediente(recetaIndex: number, ingredienteIndex: number) {
  //   this.recetas[recetaIndex].ingredientes[ingredienteIndex].checked =
  //     !this.recetas[recetaIndex].ingredientes[ingredienteIndex].checked;
  // }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscape() {
    this.isOpen = false;
  }

  onClose() {
    this.guardarEstado(); // Añadir guardado antes de cerrar
    this.close.emit();
    this.isOpen = false;
  }

  private getStorageKey(): string {
    return `lista-compra-checked-${this.cookerId}`;
  }
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

  onSolicitarEliminar(idReceta: number) {
    this.solicitarConfirmacionEliminar.emit(idReceta);
    this.onClose();
  }

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
