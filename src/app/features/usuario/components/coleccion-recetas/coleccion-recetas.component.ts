import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';

@Component({
  selector: 'app-coleccion-recetas',
  templateUrl: './coleccion-recetas.component.html',
  styleUrls: ['./coleccion-recetas.component.css'],
  standalone: true,
  imports: [
    IonIcon,
    NgClass,
    NgForOf,
    NgIf
  ]
})
export class ColeccionRecetasComponent  implements OnInit {

  constructor(private usuarioService:UsuarioService) { }

  ngOnInit() {}

  @Input() colecciones: any[] = [];

  @Input() esPerfilPropio: boolean = true;

  @Output() coleccionEliminada = new EventEmitter<any>();

  toggleExpandida(coleccion: any) {
    coleccion.expandida = !coleccion.expandida;
  }

  toggleVerMas(coleccion: any) {
    coleccion.verMas = !coleccion.verMas;
  }

  toggleVisibilidad(coleccion: any) {
    coleccion.esVisible = !coleccion.esVisible;
    this.usuarioService.editarVisibilidadColeccion(coleccion.id, coleccion.esVisible).subscribe();
  }


  eliminarColeccion(coleccion: any) {
    this.coleccionEliminada.emit(coleccion);
  }

}
