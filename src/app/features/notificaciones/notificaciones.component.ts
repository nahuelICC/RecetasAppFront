import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificacionesService} from './services/notificaciones.service';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {GetNotificacionDTO, NotificacionEncriptadaDTO} from './Models/GetNotificacionDTO';
import {RouterLink} from '@angular/router';
import {EncryptService} from '../../core/services/encrypt.service';

/**
 * Componente para mostrar notificaciones del usuario.
 */
@Component({
  selector: 'app-notificaciones',
  standalone: true,
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  imports: [
    NgIf,
    NgForOf,
    DatePipe,
    RouterLink
  ]
})
export class NotificacionesComponent implements OnInit {

  @Input() visible = false;
  @Output() cerrarNotificaciones = new EventEmitter<void>();

  notificaciones: NotificacionEncriptadaDTO[] = [];
  noLeidas: NotificacionEncriptadaDTO[] = [];
  leidas: NotificacionEncriptadaDTO[] = [];
  cargando = false;
  error: string | null = null;

  constructor(
    private notificacionesService: NotificacionesService,
    private authService: AuthService,
    private encryptService: EncryptService
  ) {}

  ngOnInit(): void {
    this.cargarNotificaciones();
  }

  /**
   * Carga las notificaciones del usuario autenticado.
   * Si el usuario no está autenticado, no se cargan notificaciones.
   */
  cargarNotificaciones(): void {
    this.cargando = true;

    // Eliminamos la verificación del ID de usuario
    this.notificacionesService.obtenerNotificacionesPorUsuario().subscribe({
      next: (data: GetNotificacionDTO[]) => {
        this.notificaciones = data.map((n: GetNotificacionDTO): NotificacionEncriptadaDTO => {
          let encryptedId: string | undefined;

          if (n.idReceta) {
            encryptedId = this.encryptService.encriptar(n.idReceta.toString());
          } else if (n.idUsuarioSeguido) {
            encryptedId = this.encryptService.encriptar(n.idUsuarioSeguido.toString());
          }

          return { ...n, encryptedId: encryptedId };
        });

        this.noLeidas = this.notificaciones.filter((n: GetNotificacionDTO) => !n.leida);
        this.leidas = this.notificaciones.filter((n: GetNotificacionDTO) => n.leida);
        this.error = null;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener notificaciones', err);
        this.error = 'Error al cargar las notificaciones.';
        this.cargando = false;
      }
    });
  }

  /**
   * Marca todas las notificaciones como leídas y cierra el panel de notificaciones.
   */
  cerrar(): void {
    this.notificacionesService.marcarNotificacionesComoLeidas().subscribe({
      next: () => {
        // Actualizar contador sin parámetros
        this.notificacionesService.actualizarContadorNotificaciones();
        this.cerrarNotificaciones.emit();
      },
      error: err => {
        console.error('Error al marcar notificaciones como leídas', err);
        this.cerrarNotificaciones.emit();
      }
    });
  }





}
