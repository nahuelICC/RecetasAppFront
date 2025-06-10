import { Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NgForOf, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PantallaCargaComponent } from '../../shared/components/pantalla-carga/pantalla-carga.component';
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import {BotonEscanerComponent} from './components/boton-escaner/boton-escaner.component';
import {BotonAddRecetaComponent} from '../../shared/components/boton-add-receta/boton-add-receta.component';

/**
 * Componente principal para la búsqueda de productos Nutriscore
 */
@Component({
  selector: 'app-nutriscore',
  templateUrl: './nutriscore.component.html',
  styleUrls: ['./nutriscore.component.css'],
  standalone: true,
  imports: [
    NgForOf,
    FormsModule,
    PantallaCargaComponent,
    NgIf,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    BotonEscanerComponent,
    BotonAddRecetaComponent
  ]
})
export class NutriscoreComponent {
  productos: any[] = [];
  terminoBusqueda: string = '';
  loading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 10;
  totalProducts: number = 0;

  private backendUrl = 'https://cookersback.onrender.com/alimento/buscar';

  constructor(private http: HttpClient) {}

  /**
   * Realiza una búsqueda de productos en el backend
   */
  buscar() {
    this.loading = true;
    this.currentPage = 1;
    this.productos = [];

    const params = new HttpParams()
      .set('termino', this.terminoBusqueda)
      .set('page', this.currentPage.toString())
      .set('page_size', this.pageSize.toString());

    this.http.get<any>(this.backendUrl, { params }).subscribe({
      next: (res) => {
        this.productos = res.products || [];
        this.totalProducts = res.count || 0;
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => this.loading = false
    });
  }

  /**
   * Carga más productos al hacer scroll infinito
   * @param event Evento de scroll infinito
   */
  cargarMas(event: any) {
    this.currentPage++;

    const params = new HttpParams()
      .set('termino', this.terminoBusqueda)
      .set('page', this.currentPage.toString())
      .set('page_size', this.pageSize.toString());

    this.http.get<any>(this.backendUrl, { params }).subscribe({
      next: (res) => {
        const nuevosProductos = res.products || [];
        this.productos = [...this.productos, ...nuevosProductos];
        this.totalProducts = res.count || this.totalProducts;

        event.target.complete();

        if (this.productos.length >= this.totalProducts) {
          event.target.disabled = true;
        }
      },
      error: (err) => {
        console.error(err);
        event.target.complete();
      }
    });
  }
}
