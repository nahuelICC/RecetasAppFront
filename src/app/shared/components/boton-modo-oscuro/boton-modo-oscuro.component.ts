import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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

  @Output() agregarIngredientesEvent: EventEmitter<string> = new EventEmitter<string>();

  constructor(private inicioService:InicioService) { }

  ngOnInit() {
  }

  agregarIngredientes() {
    this.inicioService.agregarIngredientesALaListaCompra(this.idReceta).subscribe({
      next: (res) => {
        this.agregarIngredientesEvent.emit("Ingredientes añadidos a la lista de compra");
      },
      error: (err) => {
        this.agregarIngredientesEvent.emit("Error al añadir ingredientes a la lista de compra");

      }
    });
  }



}
