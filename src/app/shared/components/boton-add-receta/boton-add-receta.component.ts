import { Component } from '@angular/core';
import {IonicModule} from '@ionic/angular';



@Component({
  selector: 'app-boton-add-receta',
  imports: [
    IonicModule
  ],
  templateUrl: './boton-add-receta.component.html',
  standalone: true,
  styleUrl: './boton-add-receta.component.css'
})
export class BotonAddRecetaComponent {
  isVisible: boolean = true;

  onWindowScroll() {
    this.isVisible = window.scrollY < 100;
  }

}
