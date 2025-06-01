import { Component, OnInit, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { IonAvatar, IonIcon } from '@ionic/angular/standalone';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderService } from '../../services/header.service';
import { RouterLink } from '@angular/router';
import {ChatService} from '../../../features/chat/chat.service';
import { Subscription } from 'rxjs';

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
export class HeaderComponent implements OnInit, OnDestroy {
  isMobile: boolean;
  menuOpen: boolean = false;
  imagenPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  isLightMode: boolean = false;
  mensajesNoLeidos: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private platform: Platform,
    public authService: AuthService,
    private headerService: HeaderService,
    private chatService: ChatService
  ) {
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

    if (this.authService.isLogged()) {
      this.subscriptions.push(
        this.chatService.conversaciones$.subscribe(conversaciones => {
          this.mensajesNoLeidos = conversaciones
            .filter(c => c.noLeidos)
            .reduce((total, conversacion) => total + (conversacion.noLeidos ? 1 : 0), 0);
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

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
      classList.remove('light-theme');
      classList.add('dark-theme');
    } else {
      classList.add('light-theme');
      classList.remove('dark-theme');
    }
  }
}
