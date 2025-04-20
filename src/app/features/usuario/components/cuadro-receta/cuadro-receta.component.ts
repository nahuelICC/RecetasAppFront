import {Component, Input, OnInit} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-cuadro-receta',
  templateUrl: './cuadro-receta.component.html',
  styleUrls: ['./cuadro-receta.component.css'],
  standalone: true,
  imports: [IonIcon, NgIf]
})
export class CuadroRecetaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input() receta!: {
    nombre: string;
    fotoReceta: string;
    esVisible: boolean;
    meGusta: number;
    guardados: number;
  };
  @Input() esPerfilPropio: boolean = true;

}
