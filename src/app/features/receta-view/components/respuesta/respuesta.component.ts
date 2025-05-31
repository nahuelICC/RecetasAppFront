import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { NgIf } from '@angular/common';
import { RespuestaService } from '../../services/respuesta.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertConfirmarComponent } from '../../../../shared/components/alert-confirmar/alert-confirmar.component';
import { Respuesta } from '../../models/Respuesta';

@Component({
  selector: 'app-respuesta',
  templateUrl: './respuesta.component.html',
  styleUrls: ['./respuesta.component.css'],
  imports: [
    TimeAgoPipe,
    NgIf,
    AlertConfirmarComponent
  ]
})
export class RespuestaComponent implements OnInit {


  @Input() respuesta!:any 
  @Output() respuestaEliminado = new EventEmitter<Respuesta>();
  

  borrarRespuesta: boolean = false;

  constructor(
        private respuestaService: RespuestaService,
        private authService: AuthService,
  ) { }

  ngOnInit() {
  }

eliminarRespuesta() {
  this.respuestaService.eliminarRespuesta(this.respuesta.id).subscribe({
    next: () => {
      this.borrarRespuesta = false;
      this.respuestaEliminado.emit(this.respuesta);
    },
    error: (error) => {
      console.error('Error al eliminar la respuesta:', error);
    }
  });
}

    obtenerNombreUsuario() {
    return this.authService.getUsername();
  }
}
