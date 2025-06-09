import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';
import {Router, RouterLink} from '@angular/router';
import { EncryptService } from '../../../../core/services/encrypt.service';

/**
 * Componente para mostrar una colección de recetas del usuario.
 */
@Component({
  selector: 'app-coleccion-recetas',
  templateUrl: './coleccion-recetas.component.html',
  styleUrls: ['./coleccion-recetas.component.css'],
  standalone: true,
  imports: [
    IonIcon,
    NgClass,
    NgForOf,
    NgIf,
  ]
})
export class ColeccionRecetasComponent  implements OnInit {

  constructor(private usuarioService:UsuarioService,private zone:NgZone,private router: Router,private encryptService: EncryptService) { }

  ngOnInit() {this.inicializarEstadoExpandido()}

  @Input() colecciones: any[] = [];

  @Input() esPerfilPropio: boolean = true;

  @Output() coleccionEliminada = new EventEmitter<any>();

  @Output() coleccionEditada = new EventEmitter<any>();

  /**
   * Método para manejar el evento de clic en una coleccion.
   * @param idReceta ID de la receta a redirigir.
   */
  toggleExpandida(coleccion: any) {
    coleccion.expandida = !coleccion.expandida;
  }

  /**
   * Método para cambiar la visibilidad de una colección.
   * @param coleccion
   */
  toggleVisibilidad(coleccion: any) {
    coleccion.esVisible = !coleccion.esVisible;
    this.usuarioService.editarVisibilidadColeccion(coleccion.id, coleccion.esVisible).subscribe();
  }


  /**
   * Método para eliminar una colección.
   * @param coleccion
   */
  eliminarColeccion(coleccion: any) {
    this.coleccionEliminada.emit(coleccion);
  }

  /**
   * Método para editar una colección.
   * @param coleccion
   */
  editarColeccion(coleccion: any) {
    this.coleccionEditada.emit(coleccion);
  }

  /**
   * Método para inicializar el estado expandido de las colecciones.
   * La primera colección se muestra expandida por defecto.
   */
  private inicializarEstadoExpandido() {
    if (this.colecciones?.length > 0) {
      this.colecciones.forEach((coleccion, index) => {
        coleccion.expandida = index === 0;
      });
    }
  }

  /**
   * Método para redirigir a la receta al hacer clic en una tarjeta de receta.
   * @param id ID de la receta a redirigir.
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
