import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { RecetaViewResponse } from '../../models/RecetaViewResponse';

@Component({
  selector: 'app-info-plato',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './info-plato.component.html',
  styleUrl: './info-plato.component.css'
})
export class InfoPlatoComponent {

  @Input() receta!:RecetaViewResponse;
}
