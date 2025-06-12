import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { RecetaViewResponse } from '../../models/RecetaViewResponse';

@Component({
  selector: 'app-info-plato',
  standalone: true,
  // imports: [IonIcon],
  templateUrl: './info-plato.component.html',
  styleUrl: './info-plato.component.css'
})
export class InfoPlatoComponent {

  @Input() receta!:RecetaViewResponse;

  calcularKcal(): number {
    return (this.receta.grasas * 9) + (this.receta.proteinas * 4) + (this.receta.hidratos * 4);
  }

  get kcalRedondeadas(): number {
    return Math.round(this.calcularKcal());
  }
}
