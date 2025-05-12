import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';
import {InicioService} from '../../../inicio/services/inicio.service';

@Component({
  selector: 'app-cuadro-receta',
  templateUrl: './cuadro-receta.component.html',
  styleUrls: ['./cuadro-receta.component.css'],
  standalone: true,
  imports: [IonIcon, NgIf]
})
export class CuadroRecetaComponent  implements OnInit {

  constructor(private usuarioService:UsuarioService, private inicioService:InicioService) { }

  ngOnInit() {}

  @Input() receta!: {
    nombre: string;
    fotoReceta: string;
    esVisible: boolean;
    meGusta: number;
    guardados: number;
    idReceta: number;
    cookerGusta: boolean;
    cookerGuardada: boolean;
  };
  @Input() esPerfilPropio: boolean = true;

  @Output() editaGuardar = new EventEmitter<any>();

  toggleVisibilidad() {
    this.receta.esVisible = !this.receta.esVisible;
    this.usuarioService.editarVisibilidadReceta(this.receta.idReceta, this.receta.esVisible).subscribe();
  }

  toggleLike() {
    if (this.receta.cookerGusta) {
      this.inicioService.eliminarMeGusta(this.receta.idReceta).subscribe({
        next: (res) => {
         this.receta.cookerGusta = false;
         this.receta.meGusta--;
          console.log('Me gusta eliminado:', res);
        },
        error: (err) => {
          console.error('Error al eliminar me gusta:', err);
        }
      });
    } else {
      this.inicioService.darMeGustaAReceta(this.receta.idReceta).subscribe({
        next: (res) => {
          this.receta.cookerGusta = true;
          this.receta.meGusta++;
        },
        error: (err) => {
          console.error('Error al dar me gusta:', err);
        }
      });
    }
  }

  toggleGuardar() {
    if (this.receta.cookerGuardada) {
      this.inicioService.eliminarRecetaGuardada(this.receta.idReceta).subscribe({
        next: (res) => {
          this.receta.cookerGuardada = false;
          this.receta.guardados--;
          console.log('Receta eliminada de guardados:', res);
        },
        error: (err) => {
          console.error('Error al eliminar de guardados:', err);
        }
      });
    } else {
      this.inicioService.guardarReceta(this.receta.idReceta).subscribe({
        next: (res) => {
          this.receta.cookerGuardada = true;
          this.receta.guardados++;
        },
        error: (err) => {
          console.error('Error al guardar receta:', err);
        }
      });
    }
    this.editaGuardar.emit();
  }

}
