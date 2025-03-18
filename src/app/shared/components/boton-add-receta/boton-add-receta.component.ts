import { Component, HostListener } from '@angular/core';
import {IonFab, IonFabButton, IonIcon} from '@ionic/angular/standalone';



@Component({
  selector: 'app-boton-add-receta',
  imports: [
    IonFabButton,
    IonIcon,
    IonFab
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
