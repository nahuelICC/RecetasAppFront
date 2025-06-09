import {Component, HostListener, Input, NgZone, OnInit} from '@angular/core';
import {RecetaInicioDTO} from '../../models/RecetaInicioDTO';
import {IonicModule} from '@ionic/angular';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {InicioService} from '../../services/inicio.service';
import {BotonComponent} from '../../../../shared/components/boton/boton.component';
import {AlertInfoComponent} from '../../../../shared/components/alert-info/alert-info.component';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {EncryptService} from '../../../../core/services/encrypt.service';
import {ellipsisHorizontalOutline, ellipsisVertical} from 'ionicons/icons';
import {ShareModalComponent} from '../share-modal/share-modal.component';

/**
 * Componente que representa una publicación de receta en la página de inicio.
 */
@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css'],
  standalone: true,
  imports: [
    IonicModule,
    NgClass,
    ShareModalComponent
  ]
})
export class PublicacionComponent  implements OnInit {

  @Input() receta!: RecetaInicioDTO;
  cookerId!: number;

  recetaLeGusta: boolean = false;
  recetaGuardada: boolean = false;
  menuAbierto: boolean = false;
  mostrarAnimacionLike: boolean = false;
  mostrarAnimacionGuardar: boolean = false;
  alertVisible: boolean = false;
  alertMessage: string = '';
  mostrarShareModal = false;
  alertType: 'success' | 'error' | 'warning' = 'success';

  constructor(private inicioService: InicioService, private authService: AuthService,private router:Router,private zone: NgZone,private encryptService:EncryptService) {}

  ngOnInit() {
    const id = this.authService.getUserId();
    if (id !== null) {
      this.cookerId = id;
      this.verificarEstadoMeGusta();
      this.verificarEstadoGuardado();
    } else {
      console.error('No se pudo obtener el ID del usuario');
    }
  }

  /**
   * Cierra el menú desplegable al hacer clic fuera de él.
   * @param event
   */
  @HostListener('document:click', ['$event'])
  cerrarMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.menuAbierto = false;
    }
  }

  /**
   * Agrega los ingredientes de la receta a la lista de compra.
   */
  agregarIngredientes() {
    this.inicioService.agregarIngredientesALaListaCompra(this.receta.id).subscribe({
      next: (res) => {
        console.log('Ingredientes añadidos a la lista de compra:', res);

        this.alertMessage = 'Ingredientes añadidos a la lista de la compra';
        this.alertType = 'success';
        this.alertVisible = true;

        setTimeout(() => this.alertVisible = false, 3000);
      },
      error: (err) => {
        console.error('Error al añadir ingredientes a la lista de compra:', err);

        this.alertMessage = 'Error al añadir ingredientes';
        this.alertType = 'error';
        this.alertVisible = true;

        setTimeout(() => this.alertVisible = false, 3000);
      }
    });

    this.menuAbierto = false;
  }


  /**
   * Verifica si el usuario ha dado "me gusta" a la receta.
   */
  verificarEstadoMeGusta() {
    this.inicioService.verificarMeGusta(this.receta.id).subscribe({
      next: (estado) => {
        this.recetaLeGusta = estado;
      },
      error: (err) => {
        console.error('Error al verificar me gusta:', err);
      }
    });
  }
  /**
   * Verifica si la receta está guardada por el usuario.
   */
  verificarEstadoGuardado() {
    this.inicioService.verificarRecetaGuardada(this.receta.id).subscribe({
      next: (estado) => {
        this.recetaGuardada = estado;
      },
      error: (err) => {
        console.error('Error al verificar si está guardada:', err);
      }
    });
  }


  /**
   *  Da "me gusta" a la receta o lo elimina si ya le gustaba.
   */
  toggleLike() {
    if (this.recetaLeGusta) {
      this.inicioService.eliminarMeGusta(this.receta.id).subscribe({
        next: (res) => {
          this.recetaLeGusta = false;
          console.log('Me gusta eliminado:', res);
        },
        error: (err) => {
          console.error('Error al eliminar me gusta:', err);
        }
      });
    } else {
      this.inicioService.darMeGustaAReceta(this.receta.id).subscribe({
        next: (res) => {
          this.recetaLeGusta = true;
          this.mostrarAnimacionLike = true;
          setTimeout(() => this.mostrarAnimacionLike = false, 700);
          console.log('Me gusta añadido:', res);
        },
        error: (err) => {
          console.error('Error al dar me gusta:', err);
        }
      });
    }
  }

  /**
   * Alterna el estado de guardado de la receta.
   */
  toggleGuardar() {
    if (this.recetaGuardada) {
      this.inicioService.eliminarRecetaGuardada(this.receta.id).subscribe({
        next: (res) => {
          this.recetaGuardada = false;
          console.log('Receta eliminada de guardados:', res);
        },
        error: (err) => {
          console.error('Error al eliminar de guardados:', err);
        }
      });
    } else {
      this.inicioService.guardarReceta(this.receta.id).subscribe({
        next: (res) => {
          this.recetaGuardada = true;
          this.mostrarAnimacionGuardar = true;
          setTimeout(() => this.mostrarAnimacionGuardar = false, 700);
          console.log('Receta guardada correctamente:', res);
        },
        error: (err) => {
          console.error('Error al guardar receta:', err);
        }
      });
    }
  }

  /**
   * Redirecciona al perfil del usuario que creó la receta.
   */
  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  /**
   * Redirecciona a la página de la receta.
   * @param id ID de la receta a redireccionar.
   */
  redireccionarReceta(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  /**
   * Abre el menú de cpmpartir la receta.
   */
  abrirShareModal(): void {
    this.menuAbierto = false;
    this.mostrarShareModal = true;
    console.log('Modal de compartir abierto para receta:', this.receta.id);
  }


  protected readonly ellipsisVertical = ellipsisVertical;
  protected readonly ellipsisHorizontalOutline = ellipsisHorizontalOutline;
}
