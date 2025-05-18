import {Component, OnInit} from '@angular/core';
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

@Component({
  selector: 'app-receta-view',
  imports: [InfoPlatoComponent, AlergenoComponent, IonAccordion, IonAccordionGroup, IonItem, IonLabel, IonIcon, ComentarioComponent, NgFor, NgIf],
  templateUrl: './receta-view.component.html',
  styleUrl: './receta-view.component.css'
})
export class RecetaViewComponent implements OnInit{

  constructor(
    private route: ActivatedRoute,
    private recetaService: RecetaService,
    private comentarioService: ComentarioService
  ) {
    addIcons({ chevronDown, timeOutline, bulbOutline });
  }

  idReceta!: string;
  receta!: RecetaViewResponse;
  pasosReceta!: PasoResponse[];
  comentariosReceta!: ComentarioResponse[];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idReceta = params.get('id')!;
      this.obtenerComentariosReceta();
      this.obtenerInfoReceta();
      this.obtenerPasosReceta();
    })
  }

  obtenerInfoReceta() {
    this.recetaService.getInfoReceta(this.idReceta).subscribe(
      (response) => {
        this.receta = response;
        console.log('Receta obtenida:', this.receta);
      },
      (error) => {
        console.error('Error al obtener la receta:', error);
      }
    )
  }

  obtenerPasosReceta() {
    this.recetaService.getPasosReceta(this.idReceta).subscribe(
      (response) => {
        this.pasosReceta = response;
        console.log('Pasos de la receta obtenidos:', this.pasosReceta);
      },
      (error) => {
        console.error('Error al obtener los pasos de la receta:', error);
      }
    )
  }

  obtenerComentariosReceta(){
    this.comentarioService.getComentariosReceta(this.idReceta).subscribe(
      (response) => {
        this.comentariosReceta = response;
        console.log('Comentarios de la receta obtenidos:', this.comentariosReceta);
      },
      (error) =>  {
        console.error('Error al obtener los comentarios de la receta:', error);}
    )
  }
}
