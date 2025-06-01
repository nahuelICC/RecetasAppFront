import { Component, OnInit } from '@angular/core';
import {Platform} from '@ionic/angular';
import {IonAvatar, IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';

import {AuthService} from '../../../core/services/auth.service';
import {HeaderService} from '../../services/header.service';
import {RouterLink} from '@angular/router';
import {NotificacionesComponent} from '../../../features/notificaciones/notificaciones.component';
import {notificationsOutline} from 'ionicons/icons';
import {NotificacionesService} from '../../../features/notificaciones/services/notificaciones.service';

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
    NotificacionesComponent,
  ]
})
export class HeaderComponent  implements OnInit {

  isMobile: boolean;
  menuOpen: boolean = false;
  imagenPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  mostrarNotificaciones = false;
  notificacionesNoLeidasCount = 0;

  constructor(private platform: Platform,public authService: AuthService, private headerService: HeaderService, private notificacionesService: NotificacionesService ) {
    this.isMobile = this.platform.width() < 768;
    this.platform.resize.subscribe(() => {
      this.isMobile = this.platform.width() < 768;
    });
  }

  ngOnInit(): void {
    this.headerService.getFotoPerfil().subscribe((response: any) => {
      if (response !== 'sin foto') {
        this.imagenPerfil = response;
      }
    });

    const idUsuario = this.authService.getUserId();
    if (idUsuario) {
      this.notificacionesService.actualizarContadorNotificaciones(idUsuario);
      this.notificacionesService.notificacionesNoLeidasCount$.subscribe(count => {
        this.notificacionesNoLeidasCount = count;
      });
    }
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

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.menuOpen) this.menuOpen = false;

    if (this.mostrarNotificaciones) {
      const idUsuario = this.authService.getUserId();
      if (idUsuario) {
        this.notificacionesService.actualizarContadorNotificaciones(idUsuario);
      }
    }
  }

  handleCerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }






}
