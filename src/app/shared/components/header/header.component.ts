import { Component, OnInit } from '@angular/core';
import {Platform} from '@ionic/angular';
import {IonIcon, IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';
import {BotonComponent} from '../boton/boton.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    NgIf,
    BotonComponent
  ]
})
export class HeaderComponent  implements OnInit {

  isMobile: boolean;

  constructor(private platform: Platform) {
    this.isMobile = this.platform.width() < 768;
    this.platform.resize.subscribe(() => {
      this.isMobile = this.platform.width() < 768;
    });
  }

  ngOnInit(): void {
  }

}
