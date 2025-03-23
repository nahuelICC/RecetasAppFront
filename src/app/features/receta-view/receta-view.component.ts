import { Component } from '@angular/core';
import { InfoPlatoComponent } from './components/info-plato/info-plato.component';
import { AlergenoComponent } from "./components/alergeno/alergeno.component";

@Component({
  selector: 'app-receta-view',
  imports: [InfoPlatoComponent, AlergenoComponent],
  templateUrl: './receta-view.component.html',
  styleUrl: './receta-view.component.css'
})
export class RecetaViewComponent {

}
