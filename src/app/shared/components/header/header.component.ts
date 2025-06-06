import { Component, OnInit } from '@angular/core';
import {Platform} from '@ionic/angular';
import {IonAvatar, IonIcon} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';
import {AuthService} from '../../../core/services/auth.service';
import {HeaderService} from '../../services/header.service';
import {RouterLink} from '@angular/router';
import {NotificacionesComponent} from '../../../features/notificaciones/notificaciones.component';
import {NotificacionesService} from '../../../features/notificaciones/services/notificaciones.service';
import {ChatService} from '../../../features/chat/chat.service';
import { UsuarioService } from '../../../features/usuario/services/usuario.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

/**
 * HeaderComponent
 */
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
export class HeaderComponent implements OnInit {
  isMobile: boolean;
  menuOpen: boolean = false;
  imagenPerfil: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  mostrarNotificaciones = false;
  notificacionesNoLeidasCount = 0;
  isLightMode: boolean = false;
  mensajesNoLeidos: number = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private platform: Platform,
    public authService: AuthService,
    private headerService: HeaderService,
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private notificacionesService: NotificacionesService
  ) {
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
    const savedTheme = localStorage.getItem('theme');
    this.isLightMode = savedTheme === 'light';
    this.applyTheme();

    if (this.authService.isLogged()) {
      this.subscriptions.push(
        this.chatService.conversaciones$.pipe(
          switchMap(conversaciones => {
            // Verificar bloqueo para cada conversación
            const verificaciones = conversaciones.map(conv =>
              this.usuarioService.perfilBloqueado(conv.otroUsuarioId.toString()).pipe(
                map(bloqueado => ({ ...conv, bloqueado })),
                catchError(() => of({ ...conv, bloqueado: false }))
              )
            );
            return forkJoin(verificaciones);
          })
        ).subscribe(conversacionesConEstado => {
          // Filtrar conversaciones no bloqueadas y contar no leídos
          this.mensajesNoLeidos = conversacionesConEstado
            .filter(conv => !conv.bloqueado && conv.noLeidos)
            .reduce((total, conv) => total + 1, 0);
        })
      );
      this.notificacionesService.actualizarContadorNotificaciones();
      this.notificacionesService.notificacionesNoLeidasCount$.subscribe(count => {
        this.notificacionesNoLeidasCount = count;
      });
    }
  }

  /**
   * ngOnDestroy
   * Unsubscribe from all subscriptions to prevent memory leaks
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Logout
   */
  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  /**
   * Abre y cierra el menú de navegación
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  /**
   * Abre y cierra el menú de notificaciones
   */
  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.menuOpen) this.menuOpen = false;

    if (this.mostrarNotificaciones) {
      this.notificacionesService.actualizarContadorNotificaciones();
    }
  }

  /**
   * Cierra el menú de notificaciones
   */
  handleCerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  /**
   * Cambia el tema de la aplicación entre claro y oscuro
   */
  toggleTheme() {
    this.isLightMode = !this.isLightMode;
    localStorage.setItem('theme', this.isLightMode ? 'light' : 'dark');
    this.applyTheme();
  }

  /**
   * Aplica el tema actual al documento al recargar la página
   */
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
