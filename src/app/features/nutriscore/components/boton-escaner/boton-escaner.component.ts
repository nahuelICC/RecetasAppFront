import { Component, OnInit } from '@angular/core';
import {IonFab, IonFabButton, IonIcon} from '@ionic/angular/standalone';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-boton-escaner',
  templateUrl: './boton-escaner.component.html',
  styleUrls: ['./boton-escaner.component.css'],
  imports: [
    IonFab,
    IonFabButton,
    IonIcon,
    RouterLink
  ]
})
export class BotonEscanerComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
