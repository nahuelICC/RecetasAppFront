import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { InfoPlatoComponent } from './components/info-plato/info-plato.component';
import { AlergenoComponent } from "./components/alergeno/alergeno.component";
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonIcon } from '@ionic/angular/standalone';
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

@Component({
  selector: 'app-receta-view',
  standalone: true,
  imports: [
    InfoPlatoComponent,
    AlergenoComponent,
    IonAccordion,
    IonAccordionGroup,
    IonItem,
    IonLabel,
    IonIcon,
    ComentarioComponent,
    NgFor,
    NgIf,
    BotonAddRecetaComponent,
    FormsModule
  ],
  templateUrl: './receta-view.component.html',
  styleUrls: ['./receta-view.component.css']
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
  const copia= new Set();
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
        this.zone.run(() => {
          this.comentariosReceta = [...response];
          this.cdr.detectChanges();
          console.log('Comentarios de la receta obtenidos:', this.comentariosReceta);
        });
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
    if (!this.textoComentario.trim()) return;

    this.comentarioService.comentarReceta({ texto: this.textoComentario }, this.idReceta).subscribe({
      next: () => {
        this.obtenerComentariosReceta();
        this.textoComentario = '';
        this.cuadroComentarioOn = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al publicar comentario:', error);
        this.cuadroComentarioOn = false;
      }
    });
  }
  mostrarCuadro() {
    this.cuadroComentarioOn = !this.cuadroComentarioOn;
  }
}