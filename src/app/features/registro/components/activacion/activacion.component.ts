import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RegistroService} from '../../services/registro.service';
import {NgClass} from '@angular/common';
import {BotonComponent} from '../../../../shared/components/boton/boton.component';

/**
 * Componente para la activación de cuenta de usuario
 */
@Component({
  selector: 'app-activacion',
  templateUrl: './activacion.component.html',
  styleUrls: ['./activacion.component.css'],
  standalone: true,
  imports: [
    NgClass,
    BotonComponent
  ]
})
export class ActivacionComponent  implements OnInit {

  message: string = '';
  isError: boolean = false;

  constructor(
    private registerService: RegistroService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.registerService.activarCuenta(token).subscribe(
          response => {
            this.message = response.message;
            this.isError = false;
          },
          error => {
            this.message = error.error.message;
            this.isError = true;
          }
        );
      } else {
        this.message = 'Token no válido.';
        this.isError = true;
      }
    });
  }

  /**
   * Función para redirigir al login
   */
  redirectToLogin() {
    this.router.navigate(['/login']);
  }

}
