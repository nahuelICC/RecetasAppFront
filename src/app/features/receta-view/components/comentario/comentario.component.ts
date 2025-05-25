// comentario.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { RespuestaComponent } from '../respuesta/respuesta.component';
import { ComentarioResponse } from '../../../../core/models/ComentarioResponse';
import { RespuestaService } from '../../services/respuesta.service';
import { FormsModule, NgModel } from '@angular/forms';
import { CrearRespuesta } from '../../../../core/models/CrearRespuesta';
import { IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/services/auth.service';
import { ComentarioService } from '../../../../core/services/comentario.service';

@Component({
  selector: 'app-comentario',
  templateUrl: './comentario.component.html',
  styleUrls: ['./comentario.component.css'],
  imports: [
    TimeAgoPipe,
    RespuestaComponent,
    NgIf,
    NgFor,
    FormsModule,
    IonIcon
  ]
})
export class ComentarioComponent implements OnInit {

  @Input() comentario!: ComentarioResponse;

  respuestas: any[] = [];
  respuestasVisibles: any[] = [];
  mostrandoRespuestas: boolean = false;
  paginaActual: number = 0;
  elementosPorPagina: number = 2;
  cuadroRespuestaOn: boolean = false;
  textoRespuesta: string = '';
  respNueva: CrearRespuesta = {
    idComentario: 0,
    texto: ''
  };

  constructor(
    private respuestaService: RespuestaService,
    private authService: AuthService,
    private comentarioService: ComentarioService
  ) { }

  ngOnInit(): void {
    this.obtenerRespuestasComentario();
  }

  obtenerRespuestasComentario() {
    this.respuestaService.ObtenerRespuestas(this.comentario.id.toString()).subscribe(
      (respuestas) => {
        this.respuestas = respuestas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      },
      (error) => {
        console.error('Error al obtener las respuestas:', error);
      }
    );
  }

  mostrarRespuestas() {
    this.mostrandoRespuestas = true;
    console.log('Respuestas totales:', this.respuestas.length);
    console.log('Respuestas visibles:', this.respuestasVisibles.length);
    if (this.respuestasVisibles.length === 0) {
      this.cargarMasRespuestas();
    }
  }

  cargarMasRespuestas() {
    const inicio = this.paginaActual * this.elementosPorPagina;
    const fin = inicio + this.elementosPorPagina;
    const nuevasRespuestas = this.respuestas.slice(inicio, fin);

    console.log(`Cargando respuestas del ${inicio} al ${fin}. Nuevas: ${nuevasRespuestas.length}`);

    this.respuestasVisibles = [...this.respuestasVisibles, ...nuevasRespuestas];
    this.paginaActual++;
    console.log('Quedan más respuestas:', this.respuestasVisibles.length < this.respuestas.length);
  }

  ocultarRespuestas() {
    this.mostrandoRespuestas = false;
    this.respuestasVisibles = [];
    this.paginaActual = 0;
  }

  mostrarCuadroRespuesta() {
    this.cuadroRespuestaOn = !this.cuadroRespuestaOn;
  }
  responderComentario() {
    this.respNueva.texto = this.textoRespuesta;
    this.respNueva.idComentario = this.comentario.id;
    this.respuestaService.ResponderComentario(this.respNueva).subscribe(
      (respuesta) => {
        this.respuestas.unshift(respuesta);
        this.respuestasVisibles.unshift(respuesta);
        this.cuadroRespuestaOn = false;
        this.textoRespuesta = '';
      },
      (error) => {
        console.error('Error al enviar respuesta:', error);
      }
    );
  }

  obtenerNombreUsuario() {
    return this.authService.getUsername();
  }

  eliminarComentario(id: number) {
    this.comentarioService.eliminarComentario(id).subscribe({
      })
  }
}