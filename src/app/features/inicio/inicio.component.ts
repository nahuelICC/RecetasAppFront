import {Component, OnInit} from '@angular/core';
import {RecetaInicioDTO} from './components/models/RecetaInicioDTO';
import {InicioService} from './components/services/inicio.service';
import {PublicacionComponent} from './components/publicacion/publicacion.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    PublicacionComponent,
    NgForOf
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
}
