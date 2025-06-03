import {Component, Input, OnInit} from '@angular/core';
import {IonFab, IonFabButton, IonIcon} from '@ionic/angular/standalone';
import {cart} from 'ionicons/icons';
import {InicioService} from '../../../features/inicio/services/inicio.service';

@Component({
  selector: 'app-boton-modo-oscuro',
  templateUrl: './boton-modo-oscuro.component.html',
  styleUrls: ['./boton-modo-oscuro.component.css'],
  standalone: true,
  imports: [
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class BotonModoOscuroComponent  implements OnInit {


  @Input() idReceta: string = '';

  constructor(private inicioService:InicioService) { }

  ngOnInit() {

  }



}
