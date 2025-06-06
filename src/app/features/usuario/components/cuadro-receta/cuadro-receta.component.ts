import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';
import {InicioService} from '../../../inicio/services/inicio.service';
import {Router, RouterLink} from '@angular/router';
import { EncryptService } from '../../../../core/services/encrypt.service';

/**
 * Componente para mostrar un cuadro de receta con sus detalles y acciones.
 */
@Component({
  selector: 'app-cuadro-receta',
  templateUrl: './cuadro-receta.component.html',
  styleUrls: ['./cuadro-receta.component.css'],
  standalone: true,
  imports: [IonIcon, NgIf, RouterLink]
})
export class CuadroRecetaComponent  implements OnInit {

  constructor(private usuarioService:UsuarioService, private inicioService:InicioService, private zone: NgZone, private router: Router, private encryptService: EncryptService) { }

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

  @Output() editaVisibilidad = new EventEmitter<any>();

  /**
   * Alterna la visibilidad de la receta.
   */
  toggleVisibilidad() {
  this.receta.esVisible = !this.receta.esVisible;
  this.usuarioService.editarVisibilidadReceta(this.receta.idReceta, this.receta.esVisible).subscribe(() => {
    this.editaVisibilidad.emit({ idReceta: this.receta.idReceta, esVisible: this.receta.esVisible });
  });
}

  /**
   * Alterna el estado de "me gusta" de la receta.
   */
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

  /**
   * Alterna el estado de guardado de la receta.
   */
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

  /**
   * Redirecciona a la página de detalles de la receta.
   * @param id
   */
  redireccionarReceta(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

}
