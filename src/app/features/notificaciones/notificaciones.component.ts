import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NotificacionesService} from './services/notificaciones.service';
import {NotificacionDTO} from './Models/NotificacionDTO';
import {DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {GetNotificacionDTO, NotificacionEncriptadaDTO} from './Models/GetNotificacionDTO';
import {RouterLink} from '@angular/router';
import {EncryptService} from '../../core/services/encrypt.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
  imports: [
    NgClass,
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

  cargarNotificaciones(): void {
    this.cargando = true;
    const idUsuario = this.authService.getUserId(); // Este debe ser el id del Cooker/Usuario

    if (idUsuario == null) {
      this.error = 'No se pudo obtener el ID del usuario';
      this.cargando = false;
      return;
    }

    this.notificacionesService.obtenerNotificacionesPorUsuario(idUsuario).subscribe({
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

  cerrar(): void {
    const idUsuario = this.authService.getUserId();
    if (idUsuario != null) {
      this.notificacionesService.marcarNotificacionesComoLeidas(idUsuario).subscribe({
        next: () => {
          this.notificacionesService.actualizarContadorNotificaciones(idUsuario);
          this.cerrarNotificaciones.emit();
        },
        error: err => {
          console.error('Error al marcar notificaciones como leídas', err);
          this.cerrarNotificaciones.emit();
        }
      });
    } else {
      this.cerrarNotificaciones.emit();
    }
  }





}
