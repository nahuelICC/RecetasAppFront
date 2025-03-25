import {Component, Input, OnInit} from '@angular/core';
import {RecetaInicioDTO} from '../../models/RecetaInicioDTO';
import {IonicModule} from '@ionic/angular';
import {NgForOf} from '@angular/common';
import {InicioService} from '../services/inicio.service';

@Component({
  selector: 'app-publicacion',
  templateUrl: './publicacion.component.html',
  styleUrls: ['./publicacion.component.css'],
  standalone: true,
  imports: [
    IonicModule,
    NgForOf
  ]
})
export class PublicacionComponent  implements OnInit {

  @Input() receta!: RecetaInicioDTO;
  cookerId: number = 1;

  recetaLeGusta: boolean = false;

  constructor(private inicioService: InicioService) {}

  ngOnInit() {
    this.verificarEstadoMeGusta();
  }

  verificarEstadoMeGusta() {
    this.inicioService.verificarMeGusta(this.receta.id, this.cookerId).subscribe({
      next: (estado) => {
        this.recetaLeGusta = estado;
      },
      error: (err) => {
        console.error('Error al verificar me gusta:', err);
      }
    });
  }


  toggleLike() {
    if (this.recetaLeGusta) {
      this.inicioService.eliminarMeGusta(this.receta.id, this.cookerId).subscribe({
        next: (res) => {
          this.recetaLeGusta = false;
          console.log('Me gusta eliminado:', res);
        },
        error: (err) => {
          console.error('Error al eliminar me gusta:', err);
        }
      });
    } else {
      this.inicioService.darMeGustaAReceta(this.receta.id, this.cookerId).subscribe({
        next: (res) => {
          this.recetaLeGusta = true;
          console.log('Me gusta añadido:', res);
        },
        error: (err) => {
          console.error('Error al dar me gusta:', err);
        }
      });
    }
  }



}
