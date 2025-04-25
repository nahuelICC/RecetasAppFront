import { Component } from '@angular/core';
import { InfoPlatoComponent } from './components/info-plato/info-plato.component';
import { AlergenoComponent } from "./components/alergeno/alergeno.component";
import { IonAccordion, IonAccordionGroup, IonItem, IonLabel } from '@ionic/angular/standalone';
import { ComentarioComponent } from './components/comentario/comentario.component';
import { ActivatedRoute, Router } from '@angular/router';
import { RecetaService } from './services/receta.service';
import { RecetaViewResponse } from './models/RecetaViewResponse';
import { NgFor } from '@angular/common';
import { PasoResponse } from './models/PasoResponse';

@Component({
  selector: 'app-receta-view',
  imports: [InfoPlatoComponent, AlergenoComponent, IonAccordion, IonAccordionGroup, IonItem, IonLabel, ComentarioComponent,NgFor],
  templateUrl: './receta-view.component.html',
  styleUrl: './receta-view.component.css'
})
export class RecetaViewComponent {

  constructor(
    private route: ActivatedRoute,
    private recetaService: RecetaService
  ) {

  }

  idReceta!: string;
  receta!: RecetaViewResponse;
  pasosReceta!: PasoResponse[];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idReceta = params.get('id')!;
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




}
