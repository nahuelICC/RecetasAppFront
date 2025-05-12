import {Component, OnInit} from '@angular/core';
import {RecetaInicioDTO} from './models/RecetaInicioDTO';
import {InicioService} from './services/inicio.service';
import {NgForOf, NgIf} from '@angular/common';
import {PublicacionComponent} from './components/publicacion/publicacion.component';
import {BotonAddRecetaComponent} from '../../shared/components/boton-add-receta/boton-add-receta.component';
import {IonicModule} from '@ionic/angular';
import {AuthService} from '../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    PublicacionComponent,
    NgForOf,
    NgIf,
    BotonAddRecetaComponent,
    IonicModule
  ],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  recetas: RecetaInicioDTO[] = [];// Controla qué vista se muestra
  cookerId!: number;
  ultimasRecetas: RecetaInicioDTO[] = [];
  topRecetas: RecetaInicioDTO[] = [];
  recetasParaTi: RecetaInicioDTO[] = [];
  recetasParaTiVisible: RecetaInicioDTO[] = [];
  recetasSiguiendo: RecetaInicioDTO[] = [];
  recetasSiguiendoVisible: RecetaInicioDTO[] = [];
  cantidadInicialParaTi = 6;
  cantidadInicialSiguiendo = 6;

  constructor(private inicioService: InicioService, private authService: AuthService) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    if (id !== null) {
      this.cookerId = id;
      this.cargarParaTi();
      this.cargarSiguiendo();
      this.cargarUltimasRecetas();
      this.cargarRecetasTop();
    } else {
      console.error('No se pudo obtener el ID del usuario');
    }
  }

  cargarParaTi() {
    this.inicioService.getTop10RecetasByCookerId().subscribe(recetas => {
      this.recetasParaTi = recetas;
      this.recetasParaTiVisible = this.recetasParaTi.slice(0, 6);
    });
  }

  cargarSiguiendo() {
    this.inicioService.getRecetasSiguiendo().subscribe(recetas => {
      this.recetasSiguiendo = recetas;
      this.recetasSiguiendoVisible = this.recetasSiguiendo.slice(0, 6);
    });
  }

  verMasParaTi() {
    const siguiente = this.recetasParaTiVisible.length + 3;
    this.recetasParaTiVisible = this.recetasParaTi.slice(0, siguiente);
  }

  verMasSiguiendo() {
    const siguiente = this.recetasSiguiendoVisible.length + 3;
    this.recetasSiguiendoVisible = this.recetasSiguiendo.slice(0, siguiente);
  }

  verMenosParaTi() {
    this.recetasParaTiVisible = this.recetasParaTi.slice(0, this.cantidadInicialParaTi);
  }

  verMenosSiguiendo() {
    this.recetasSiguiendoVisible = this.recetasSiguiendo.slice(0, this.cantidadInicialSiguiendo);
  }

  cargarUltimasRecetas() {
    this.inicioService.getUltimasRecetas().subscribe(recetas => {
      this.ultimasRecetas = recetas;
    });
  }

  cargarRecetasTop() {
    this.inicioService.getTop10RecetasFavoritas().subscribe(
      (data) => {
        this.topRecetas = data;
      },
      (error) => {
        console.error('Error al obtener recetas más gustadas', error);
      }
    );
  }

  // mostrarParaTi() {
  //   this.vista = 'paraTi';   // Cambia la vista a 'paraTi'
  //   this.cargarRecetas();
  // }
  //
  // mostrarSiguiendo() {
  //   this.vista = 'siguiendo';  // Cambia la vista a 'siguiendo'
  //   this.cargarRecetas();
  // }
}
