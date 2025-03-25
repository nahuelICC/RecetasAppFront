import {Component, OnInit} from '@angular/core';
import {RecetaInicioDTO} from './models/RecetaInicioDTO';
import {InicioService} from './components/services/inicio.service';
import {NgForOf, NgIf} from '@angular/common';
import {PublicacionComponent} from './components/publicacion/publicacion.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    PublicacionComponent,
    NgForOf,
    NgIf
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent implements OnInit {

  recetas: RecetaInicioDTO[] = [];
  vista: string = 'paraTi'; // Vista por defecto
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
