import {Component, OnInit} from '@angular/core';
import {RecetaInicioDTO} from './models/RecetaInicioDTO';
import {InicioService} from './services/inicio.service';
import {NgForOf, NgIf} from '@angular/common';
import {PublicacionComponent} from './components/publicacion/publicacion.component';
import {BotonAddRecetaComponent} from '../../shared/components/boton-add-receta/boton-add-receta.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    PublicacionComponent,
    NgForOf,
    NgIf,
    BotonAddRecetaComponent
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  recetas: RecetaInicioDTO[] = [];
  vista: 'paraTi' | 'siguiendo' = 'paraTi';
  cookerId: number = 1;

  constructor(private inicioService: InicioService) {}

  ngOnInit(): void {
    this.cargarRecetas();
  }

  cargarRecetas() {
    if (this.vista === 'paraTi') {
      this.inicioService.getTop10RecetasByCookerId(this.cookerId).subscribe(recetas => {
        this.recetas = recetas;
      });
    } else if (this.vista === 'siguiendo') {
      this.inicioService.getRecetasSiguiendo(this.cookerId).subscribe(recetas => {
        this.recetas = recetas;
      });
    }
  }

  mostrarParaTi() {
    this.vista = 'paraTi';
    this.cargarRecetas();
  }

  mostrarSiguiendo() {
    this.vista = 'siguiendo';
    this.cargarRecetas();
  }
}
