import { Component, OnInit } from '@angular/core';
import {Platform} from '@ionic/angular';
import {IonAvatar, IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';

import {AuthService} from '../../../core/services/auth.service';
import {HeaderService} from '../../services/header.service';
import {RouterLink} from '@angular/router';
import {ioniconContent} from 'ionicons/dist/types/components/icon/request';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [
    IonIcon,
    NgIf,
    IonAvatar,
    RouterLink,
  ]
})
export class HeaderComponent  implements OnInit {

  isMobile: boolean;
  menuOpen: boolean = false;
  imagenPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  isLightMode = false;

  constructor(private platform: Platform,public authService: AuthService, private headerService: HeaderService) {
    this.isMobile = this.platform.width() < 768;
    this.platform.resize.subscribe(() => {
      this.isMobile = this.platform.width() < 768;
    });
  }

  ngOnInit(): void {
    this.headerService.getFotoPerfil().subscribe((response: any) => {
      console.log(response);
      if (response !== 'sin foto') {
        this.imagenPerfil = response;
      }
    });
    const savedTheme = localStorage.getItem('theme');
    this.isLightMode = savedTheme === 'light';
    this.applyTheme();
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
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
