// comentario.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { RespuestaComponent } from '../respuesta/respuesta.component';
import { ComentarioResponse } from '../../../../core/models/ComentarioResponse';
import { RespuestaService } from '../../services/respuesta.service';
import { FormsModule} from '@angular/forms';
import { CrearRespuesta } from '../../../../core/models/CrearRespuesta';
import { AuthService } from '../../../../core/services/auth.service';
import { ComentarioService } from '../../../../core/services/comentario.service';
import { AlertType } from '../../../../shared/components/alert-info/alert-info.component';
import { AlertConfirmarComponent } from '../../../../shared/components/alert-confirmar/alert-confirmar.component';

@Component({
  selector: 'app-comentario',
  standalone: true,
  templateUrl: './comentario.component.html',
  styleUrls: ['./comentario.component.css'],
  imports: [
    TimeAgoPipe,
    RespuestaComponent,
    NgIf,
    NgFor,
    FormsModule,
    AlertConfirmarComponent
  ]
})
export class ComentarioComponent implements OnInit {

  @Input() comentario!: ComentarioResponse;
  @Input() idReceta!: string;
  @Output() comentarioEliminado = new EventEmitter<ComentarioResponse>();
  @Output() comentarioDenunciado = new EventEmitter<ComentarioResponse>();

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
  borrarComentario: boolean = false;
  isAlertVisible: boolean = false;
  alertType: AlertType = 'error';
  alertMessage: string = '';
  imagenPerfilUsuario: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  mostrarAlertaConfirmacion: boolean = false;
  mensajeAlertaConfirmacion: string = '';
  accionConfirmada!: () => void;



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
    this.respuestasVisibles = [...this.respuestasVisibles, ...nuevasRespuestas];
    this.paginaActual++;
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
  if (!this.textoRespuesta.trim()) return;  this.respNueva.texto = this.textoRespuesta;
    this.respNueva.idComentario = this.comentario.id;

    this.respuestaService.ResponderComentario(parseInt(this.idReceta), this.respNueva).subscribe(
      (nuevaRespuesta) => {
      this.respuestas = [nuevaRespuesta, ...this.respuestas];

      if (this.mostrandoRespuestas) {
        this.paginaActual = 0;
        this.respuestasVisibles = this.respuestas.slice(0, this.elementosPorPagina);
      }

      this.textoRespuesta = '';
      this.cuadroRespuestaOn = false;
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
      next: () => {
        this.comentarioEliminado.emit(this.comentario);
      }
    })
  }
  confirmarEliminacion() {
    this.mensajeAlertaConfirmacion = '¿Estás seguro de que quieres eliminar el comentario?';
    this.accionConfirmada = () => this.eliminarComentario(this.comentario.id);
    this.mostrarAlertaConfirmacion = true;
  }
  confirmarDenuncia() {
    this.mensajeAlertaConfirmacion = '¿Estás seguro de que quieres denunciar el comentario?';
    this.accionConfirmada = () => this.denunciarComentario();
    this.mostrarAlertaConfirmacion = true;
  }
  confirmarAccion() {
    if (this.accionConfirmada) {
      this.accionConfirmada();
    }
    this.mostrarAlertaConfirmacion = false;
  }
  cancelarAccion() {
    this.mostrarAlertaConfirmacion = false;
  }

recargarRespuestasComentario(respuestaEliminada: any) {
  this.respuestas = this.respuestas.filter(r => r.id !== respuestaEliminada.id);
  this.respuestasVisibles = this.respuestasVisibles.filter(r => r.id !== respuestaEliminada.id);

  if (this.respuestasVisibles.length < this.elementosPorPagina && this.respuestas.length > 0) {
    this.paginaActual = 0;
    this.respuestasVisibles = this.respuestas.slice(0, this.elementosPorPagina);
  }

  this.isAlertVisible = true;
  this.alertType = 'success';
  this.alertMessage = 'Respuesta eliminada correctamente';
  setTimeout(() => {
    this.isAlertVisible = false;
  }, 3000);
}

  denunciarComentario() {
    this.comentarioService.denunciarComentario(this.comentario.id).subscribe({
      next: () => {
        this.comentarioDenunciado.emit();
      },
      error: (err) => {
        console.error('Error al denunciar comentario:', err);
      }
    });
  }




}
