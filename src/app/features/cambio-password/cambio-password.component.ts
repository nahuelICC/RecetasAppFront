import { Component} from '@angular/core';
import {AlertInfoComponent, AlertType} from '../../shared/components/alert-info/alert-info.component';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {CambioPasswordService} from './services/cambio-password.service';
import {NgIf} from '@angular/common';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {AlertConfirmarComponent} from '../../shared/components/alert-confirmar/alert-confirmar.component';

@Component({
  selector: 'app-cambio-password',
  templateUrl: './cambio-password.component.html',
  styleUrls: ['./cambio-password.component.css'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    BotonComponent,
    AlertConfirmarComponent,
    AlertInfoComponent
  ],
  standalone: true
})
export class CambioPasswordComponent{

  errorMessage: string | null = null;
  isLoading = false;
  showAlertConfirmar = false;
  alertMessage = 'Revisa tu correo para cambiar tu contraseña';
  isAlertVisible = false;
  alertType: AlertType = 'warning';
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });
  constructor(private router: Router, private cambioPasswordService:CambioPasswordService) { }

  /**
   * Método que se ejecuta al enviar el formulario
   */
  onSubmit() {
    this.cambioPasswordService.solicitarCambioPassword(this.form.value.email).subscribe({
      next: () => this.showAlertConfirmar = true,
      error: (err) => {
        this.alertMessage = err.error.message;
        this.isAlertVisible = true;
      }
    });
  }

  /**
   * Método que se ejecuta al confirmar la alerta
   */
  onConfirm() {
    this.showAlertConfirmar = false;
    this.router.navigate(['/login']);
  }

}
