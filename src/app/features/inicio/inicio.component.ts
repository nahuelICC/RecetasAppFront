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

  constructor(private inicioService: InicioService) {}

  ngOnInit(): void {
    this.inicioService.getTop10RecetasByCookerId(1)
      .subscribe((recetas) => {
        this.recetas = recetas;
      });
  }

  vista: string = 'paraTi'; // Por defecto, se muestra "Para ti"

  mostrarParaTi() {
    this.vista = 'paraTi';
  }

  mostrarSiguiendo() {
    this.vista = 'siguiendo';
  }
}
