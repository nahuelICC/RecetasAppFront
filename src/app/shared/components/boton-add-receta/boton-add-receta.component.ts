import {Component, OnDestroy, OnInit} from '@angular/core';
import {IonicModule} from '@ionic/angular';
import {RouterLink} from '@angular/router';
import {NgIf} from '@angular/common';



@Component({
  selector: 'app-boton-add-receta',
  imports: [
    IonicModule,
    RouterLink,
    NgIf
  ],
  templateUrl: './boton-add-receta.component.html',
  standalone: true,
  styleUrl: './boton-add-receta.component.css'
})
export class BotonAddRecetaComponent {


}
