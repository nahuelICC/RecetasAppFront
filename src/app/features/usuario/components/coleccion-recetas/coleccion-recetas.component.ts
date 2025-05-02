import {Component, Input, OnInit} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgClass, NgForOf, NgIf} from '@angular/common';

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

  constructor() { }

  ngOnInit() {}

  @Input() colecciones: any[] = [];

  @Input() esPerfilPropio: boolean = true;

  toggleExpandida(coleccion: any) {
    coleccion.expandida = !coleccion.expandida;
  }

  toggleVerMas(coleccion: any) {
    coleccion.verMas = !coleccion.verMas;
  }

  toggleVisibilidad(coleccion: any) {
    coleccion.esVisible = !coleccion.esVisible;
  }

}
