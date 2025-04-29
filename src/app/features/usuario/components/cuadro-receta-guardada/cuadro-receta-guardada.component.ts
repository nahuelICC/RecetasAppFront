import {Component, Input, OnInit} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';

@Component({
  selector: 'app-cuadro-receta-guardada',
  templateUrl: './cuadro-receta-guardada.component.html',
  styleUrls: ['./cuadro-receta-guardada.component.css'],
  standalone: true,
  imports: [IonIcon]
})
export class CuadroRecetaGuardadaComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  @Input() receta!: {
    nombre: string;
    fotoReceta: string;
    tiempo: string;
  };

}
