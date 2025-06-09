import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { InfoPlatoComponent } from './components/info-plato/info-plato.component';
import { AlergenoComponent } from "./components/alergeno/alergeno.component";
import { ComentarioComponent } from './components/comentario/comentario.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RecetaService } from './services/receta.service';
import { RecetaViewResponse } from './models/RecetaViewResponse';
import { NgFor, NgIf } from '@angular/common';
import { PasoResponse } from './models/PasoResponse';
import { addIcons } from 'ionicons';
import { chevronDown, timeOutline, bulbOutline } from 'ionicons/icons';
import { ComentarioService } from '../../core/services/comentario.service';
import { ComentarioResponse } from '../../core/models/ComentarioResponse';
import { BotonAddRecetaComponent } from '../../shared/components/boton-add-receta/boton-add-receta.component';
import { EncryptService } from '../../core/services/encrypt.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { Alergeno } from './models/Alergeno';
import { AlertInfoComponent, AlertType } from '../../shared/components/alert-info/alert-info.component';
import { InfiniteScrollCustomEvent, IonAvatar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import {BotonModoOscuroComponent} from '../../shared/components/boton-modo-oscuro/boton-modo-oscuro.component';

/**
 * Componente para visualizar una receta.
 */
@Component({
  selector: 'app-receta-view',
  standalone: true,
  imports: [
    ComentarioComponent,
    NgFor,
    NgIf,
    BotonAddRecetaComponent,
    FormsModule,
    AlertInfoComponent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonList,
    InfoPlatoComponent,
    AlergenoComponent,
    BotonModoOscuroComponent
  ],
  templateUrl: './receta-view.component.html',
  styleUrls: ['./receta-view.component.css'],
})
export class RecetaViewComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private recetaService: RecetaService,
    private comentarioService: ComentarioService,
    private zone: NgZone,
    private encryptService: EncryptService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ chevronDown, timeOutline, bulbOutline });
  }

  idReceta!: string;
  receta!: RecetaViewResponse;
  pasosReceta!: PasoResponse[];
  comentariosReceta: ComentarioResponse[] = [];
  cuadroComentarioOn: boolean = false;
  textoComentario: string = '';
  listaAlergenos: Alergeno[] = [];
  AlertVisible: boolean = false;
  alertType: AlertType = 'error';
  alertMessage: string = '';
  borrarComentario: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  hasMoreItems: boolean = true;
  currentItemsToShow: number = 5;
  allComentarios: ComentarioResponse[] = [];
  displayedComentarios: ComentarioResponse[] = [];


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = this.route.snapshot.paramMap.get('id');
      const idDecrypt = this.encryptService.desencriptar(id || '');
      this.idReceta = idDecrypt;
      this.obtenerComentariosReceta();
      this.obtenerInfoReceta();
      this.obtenerAlergenos();
      this.obtenerPasosReceta();
    });
  }

  /**
   * Obtiene la información de la receta desde el servicio.
   */
  obtenerInfoReceta() {
    this.recetaService.getInfoReceta(this.idReceta).subscribe(
      (response) => {
        this.receta = response;
        this.obtenerAlergenos();
      },
      (error) => {
        console.error('Error al obtener la receta:', error);
      }
    );
  }

  /**
   * Obtiene los alérgenos de la receta y los filtra para eliminar duplicados.
   */
  obtenerAlergenos() {
    if (!this.receta?.alergenos) return;
    const copia = new Set();
    this.listaAlergenos = this.receta.alergenos.filter(alergeno => {
      if (copia.has(alergeno.id)) {
        return false;
      }
      copia.add(alergeno.id);
      return true;
    });
  }
  get columnasIngredientes(): any[][] {
    const columnas = [];
    const ingredientes = this.receta.ingredientes;
    const itemsPorColumna = 5;

    for (let i = 0; i < ingredientes.length; i += itemsPorColumna) {
      columnas.push(ingredientes.slice(i, i + itemsPorColumna));
    }

    return columnas;
  }

  /**
   * Obtiene los pasos de la receta desde el servicio.
   */
  obtenerPasosReceta() {
    this.recetaService.getPasosReceta(this.idReceta).subscribe(
      (response) => {
        this.pasosReceta = response.sort((a, b) => a.numero - b.numero);
        console.log('Pasos de la receta obtenidos:', this.pasosReceta);
      },
      (error) => {
        console.error('Error al obtener los pasos de la receta:', error);
      }
    );
  }

  /**
   * Obtiene los comentarios de la receta desde el servicio.
   */
  obtenerComentariosReceta() {
    this.comentarioService.getComentariosReceta(this.idReceta).subscribe(
      (response) => {
        this.allComentarios = [...response];
        this.displayedComentarios = this.allComentarios
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, this.currentItemsToShow);
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error al obtener los comentarios de la receta:', error);
      }
    );
  }

  /**
   * Redirecciona al perfil del usuario que ha publicado la receta.
   * @param id ID del usuario.
   */
  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta/', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  /**
   * Compara si el usuario está logueado.
   * @returns true si el usuario está logueado, false en caso contrario.
   */
  compararLogin(): boolean {
    return this.authService.isLogged();
  }

  /**
   * Responde a un comentario en la receta.
   */
  responderReceta() {
    this.comentarioService.comentarReceta({ texto: this.textoComentario }, this.idReceta).subscribe({
      next: (nuevoComentario) => {
        this.textoComentario = '';
        this.cuadroComentarioOn = false;
        console.log("carga");
        this.obtenerComentariosReceta();
      },
      error: (error) => {
        console.error('Error al publicar comentario:', error);
        this.cuadroComentarioOn = false;
      }
    });
  }

  /**
   * Recarga los comentarios de la receta después de eliminar uno.
   */
  recargarComentariosReceta() {
    this.currentItemsToShow = 5;
    this.obtenerComentariosReceta();
    this.AlertVisible = true;
    this.alertType = 'success';
    this.alertMessage = 'Comentario eliminado correctamente';
    setTimeout(() => {
      this.AlertVisible = false;
    }, 3000);
  }

  /**
   * Cambia el estado del cuadro de comentario.
   */
  mostrarCuadro() {
    this.cuadroComentarioOn = !this.cuadroComentarioOn;
  }

  /**
   * Carga más comentarios al hacer scroll infinito.
   */
  onIonInfinite(event: InfiniteScrollCustomEvent) {
    setTimeout(() => {
      this.currentItemsToShow += 5;
      this.displayedComentarios = this.allComentarios.slice(0, this.currentItemsToShow);
      if (this.displayedComentarios.length >= this.allComentarios.length) {
        event.target.disabled = true;
      }
      event.target.complete();
      this.cdr.markForCheck();
    }, 500);
  }

  /**
   * Muestra una alerta de éxito al denunciar un comentario.
   */
  mostrarAlertaDenuncia() {
    this.AlertVisible = true;          // Mostrar la alerta
    this.alertType = 'success';        // Tipo de alerta
    this.alertMessage = 'Comentario denunciado correctamente'; // Mensaje

    setTimeout(() => {
      this.AlertVisible = false;      // Ocultar después de 3 segundos
    }, 3000);
  }


  /**
   * Muestra una alerta de éxito o error al añadir ingredientes a la lista de compra.
   * @param $event Evento que contiene el mensaje de la alerta.
   */
  mostrarAlertaIngredientes($event: string) {
    if ($event === 'Ingredientes añadidos a la lista de compra') {
      this.AlertVisible = true;
      this.alertType = 'success';
      this.alertMessage = $event;

      setTimeout(() => {
        this.AlertVisible = false;
      }, 3000);
    }else {
      this.AlertVisible = true;
      this.alertType = 'error';
      this.alertMessage = $event;

      setTimeout(() => {
        this.AlertVisible = false;
      }, 3000);
    }

  }

  /**
   * Redirecciona al perfil del usuario que creó la receta.
   */
  redireccionarPerfilUsuario(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }
}
