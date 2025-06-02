import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { ChatService } from '../../../chat/chat.service';
import { UsuarioService } from '../../../usuario/services/usuario.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EncryptService } from '../../../../core/services/encrypt.service';

@Component({
  selector: 'app-share-modal',
  templateUrl: './share-modal.component.html',
  styleUrls: ['./share-modal.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonIcon]
})
export class ShareModalComponent {
  @Input() recetaId: string = '';
  @Output() closeModal = new EventEmitter<void>();

  private chatService = inject(ChatService);
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private encryptService = inject(EncryptService);

  usuariosSeguidos: any[] = [];
  usuariosFiltrados: any[] = [];
  terminoBusqueda: string = '';
  usuariosSeleccionados: Set<number> = new Set();
  loading = true;
  error = '';

  ngOnInit(): void {
    this.cargarUsuariosSeguidos();
  }

  private cargarUsuariosSeguidos(): void {
    this.loading = true;
    this.usuarioService.listaSeguidos(true).subscribe({
      next: (seguidos) => {
        this.usuariosSeguidos = seguidos;
        this.usuariosFiltrados = [...seguidos];
        this.loading = false;
        console.log('Usuarios seguidos cargados:', this.usuariosSeguidos);
      },
      error: (err) => {
        console.error('Error al cargar usuarios seguidos:', err);
        this.error = 'Error al cargar los contactos';
        this.loading = false;
      }
    });
  }

  filtrarUsuarios(): void {
    const termino = this.terminoBusqueda.toLowerCase();
    this.usuariosFiltrados = this.usuariosSeguidos.filter(usuario =>
      usuario.nombre?.toLowerCase().includes(termino) ||
      usuario.username?.toLowerCase().includes(termino)
    );
  }

  toggleSeleccionUsuario(usuarioId: number): void {
    if (this.usuariosSeleccionados.has(usuarioId)) {
      this.usuariosSeleccionados.delete(usuarioId);
    } else {
      this.usuariosSeleccionados.add(usuarioId);
    }
    console.log('Usuarios seleccionados:', this.usuariosSeleccionados);
  }

  estaSeleccionado(usuarioId: number): boolean {
    return this.usuariosSeleccionados.has(usuarioId);
  }

  enviarReceta(): void {
    if (!this.recetaId || this.usuariosSeleccionados.size === 0) return;

    const usuarioActualId = this.authService.getUserId();
    if (!usuarioActualId) {
      console.error('No se pudo obtener el ID del usuario actual');
      return;
    }

    this.usuarioService.getPerfil().subscribe({
      next: (perfil) => {
        const linkReceta = `${window.location.origin}/receta/${this.encryptService.encriptar(this.recetaId)}`;
        const mensajeTexto = `¡Mira esta receta que encontré! ${linkReceta}`;

        Array.from(this.usuariosSeleccionados).forEach(destinatarioId => {
          this.chatService.enviarMensaje({
            texto: mensajeTexto,
            remitenteId: usuarioActualId,
            destinatarioId: destinatarioId,
            fecha: new Date(),
            leido: false,
            borrado: false,
            remitenteNombre: perfil.nombre || 'Usuario',
            remitenteFoto: perfil.fotoPerfil || 'assets/frutero.png'
          }).subscribe({
            next: (response: any) => {
              console.log(`Receta enviada a ${destinatarioId}:`, response);
            },
            error: (err: any) => {
              console.error(`Error al enviar receta a ${destinatarioId}:`, err);
            }
          });
        });

        this.closeModal.emit();
        console.log('Receta compartida con éxito');
      },
      error: (err) => {
        console.error('Error al obtener perfil:', err);
      }
    });
  }

  cerrarModal(): void {
    this.closeModal.emit();
  }
}
