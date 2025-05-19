import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';
import {Router, RouterLink} from '@angular/router';
import { EncryptService } from '../../../../core/services/encrypt.service';

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
    RouterLink
  ]
})
export class ColeccionRecetasComponent  implements OnInit {

  constructor(private usuarioService:UsuarioService,private zone:NgZone,private router: Router,private encryptService: EncryptService) { }

  ngOnInit() {this.inicializarEstadoExpandido()}

  @Input() colecciones: any[] = [];

  @Input() esPerfilPropio: boolean = true;

  @Output() coleccionEliminada = new EventEmitter<any>();

  @Output() coleccionEditada = new EventEmitter<any>();

  toggleExpandida(coleccion: any) {
    coleccion.expandida = !coleccion.expandida;
  }

  toggleVisibilidad(coleccion: any) {
    coleccion.esVisible = !coleccion.esVisible;
    this.usuarioService.editarVisibilidadColeccion(coleccion.id, coleccion.esVisible).subscribe();
  }


  eliminarColeccion(coleccion: any) {
    this.coleccionEliminada.emit(coleccion);
  }

  editarColeccion(coleccion: any) {
    this.coleccionEditada.emit(coleccion);
  }

  private inicializarEstadoExpandido() {
    if (this.colecciones?.length > 0) {
      this.colecciones.forEach((coleccion, index) => {
        coleccion.expandida = index === 0;
      });
    }
  }

  redireccionarReceta(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

}
