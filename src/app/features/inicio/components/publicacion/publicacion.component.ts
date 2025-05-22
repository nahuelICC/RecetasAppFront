import {Component, HostListener, Input, NgZone, OnInit} from '@angular/core';
import {RecetaInicioDTO} from '../../models/RecetaInicioDTO';
import {IonicModule} from '@ionic/angular';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {InicioService} from '../../services/inicio.service';
import {BotonComponent} from '../../../../shared/components/boton/boton.component';
import {AlertInfoComponent} from '../../../../shared/components/alert-info/alert-info.component';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {EncryptService} from '../../../../core/services/encrypt.service';
import {ellipsisHorizontalOutline, ellipsisVertical} from 'ionicons/icons';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css'],
  standalone: true,
  imports: [
    IonicModule,
    NgForOf,
    NgIf,
    BotonComponent,
    AlertInfoComponent,
    RouterLink,
    NgClass
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

  @HostListener('document:click', ['$event'])
  cerrarMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.menuAbierto = false;
    }
  }

  agregarIngredientes() {
    this.inicioService.agregarIngredientesALaListaCompra(this.receta.id, this.cookerId).subscribe({
      next: (res) => {
        console.log('Ingredientes añadidos a la lista de compra:', res);

        // Mostrar alerta
        this.alertMessage = 'Ingredientes añadidos a la lista de la compra';
        this.alertType = 'success';
        this.alertVisible = true;

        // Ocultar alerta después de 3 segundos
        setTimeout(() => this.alertVisible = false, 3000);
      },
      error: (err) => {
        console.error('Error al añadir ingredientes a la lista de compra:', err);

        // También podrías mostrar una alerta de error si lo deseas
        this.alertMessage = 'Error al añadir ingredientes';
        this.alertType = 'error';
        this.alertVisible = true;

        setTimeout(() => this.alertVisible = false, 3000);
      }
    });

    this.menuAbierto = false;
  }



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

  handleDobleClick() {
    if (!this.recetaLeGusta) {
      this.toggleLike();
    }
  }

  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }


  protected readonly ellipsisVertical = ellipsisVertical;
  protected readonly ellipsisHorizontalOutline = ellipsisHorizontalOutline;
}
