import { Component, OnInit } from '@angular/core';
import {IonFab, IonFabButton, IonIcon} from '@ionic/angular/standalone';

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

  isLightMode = false;

  constructor() { }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    this.isLightMode = savedTheme === 'light';
    this.applyTheme();
  }

  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    localStorage.setItem('theme', this.isLightMode ? 'light' : 'dark');
    this.applyTheme();
  }


  applyTheme() {
    const classList = document.documentElement.classList;
    if (this.isLightMode) {
      classList.add('light-theme');
      classList.remove('dark-theme');
    } else {
      classList.remove('light-theme');
      classList.add('dark-theme');
    }
  }



}
