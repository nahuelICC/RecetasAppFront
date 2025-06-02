import { Component, NgZone, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { InfoPlatoComponent } from './components/info-plato/info-plato.component';
import { AlergenoComponent } from "./components/alergeno/alergeno.component";
import { IonAccordion, IonAccordionGroup, IonIcon } from '@ionic/angular/standalone';
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
import { AlertConfirmarComponent } from '../../shared/components/alert-confirmar/alert-confirmar.component';
import { InfiniteScrollCustomEvent, IonAvatar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-receta-view',
  standalone: true,
  imports: [
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    IonIcon,
    ComentarioComponent,
    NgFor,
    NgIf,
    BotonAddRecetaComponent,
    FormsModule,
    AlertInfoComponent,
    IonAvatar,
    IonContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonItem,
    IonLabel,
    IonList,
    InfoPlatoComponent,
    AlergenoComponent
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

  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta/', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  compararLogin(): boolean {
    return this.authService.isLogged();
  }

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

  mostrarCuadro() {
    this.cuadroComentarioOn = !this.cuadroComentarioOn;
  }

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

  mostrarAlertaDenuncia() {
    this.AlertVisible = true;          // Mostrar la alerta
    this.alertType = 'success';        // Tipo de alerta
    this.alertMessage = 'Comentario denunciado correctamente'; // Mensaje

    setTimeout(() => {
      this.AlertVisible = false;      // Ocultar después de 3 segundos
    }, 3000);
  }

  // generateItems() {
  //   const newItems = this.comentariosReceta.slice(this.comentariosReceta.length, this.comentariosReceta.length + 5);
  //   this.comentariosReceta.push(...newItems);
  //   if (newItems.length === 0) {
  //     this.isAlertVisible = true;
  //     this.alertMessage = 'No hay más comentarios para mostrar';
  //     setTimeout(() => {
  //       this.isAlertVisible = false;
  //     }, 3000);
  //   }
  // }


}
