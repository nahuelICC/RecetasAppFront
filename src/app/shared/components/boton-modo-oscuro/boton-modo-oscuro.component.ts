import {Component, Input, OnInit} from '@angular/core';
import {IonContent, IonFab, IonFabButton, IonIcon, IonPopover} from '@ionic/angular/standalone';
import {InicioService} from '../../../features/inicio/services/inicio.service';

@Component({
  selector: 'app-boton-modo-oscuro',
  templateUrl: './boton-modo-oscuro.component.html',
  styleUrls: ['./boton-modo-oscuro.component.css'],
  standalone: true,
  imports: [
    IonFab,
    IonFabButton,
    IonIcon,
    IonPopover,
    IonContent
  ]
})
export class BotonModoOscuroComponent  implements OnInit {


  @Input() idReceta: number = 0;

  constructor(private inicioService:InicioService) { }

  ngOnInit() {
  }

  agregarIngredientes() {
    this.inicioService.agregarIngredientesALaListaCompra(this.idReceta).subscribe({
      next: (res) => {
        console.log('Ingredientes añadidos a la lista de compra:', res);
      },
      error: (err) => {
        console.error('Error al añadir ingredientes a la lista de compra:', err);

      }
    });
  }



}
