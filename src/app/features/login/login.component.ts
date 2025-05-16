import {Component} from '@angular/core';
import {AuthService} from '../../core/services/auth.service';
import {LoginService} from './services/login.service';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {BotonComponent} from '../../shared/components/boton/boton.component';
import {NgIf} from '@angular/common';
import {PantallaCargaComponent} from '../../shared/components/pantalla-carga/pantalla-carga.component';
import {AlertInfoComponent, AlertType} from '../../shared/components/alert-info/alert-info.component';

@Component({
  selector: 'app-login',
  imports: [
    BotonComponent,
    RouterLink,
    NgIf,
    ReactiveFormsModule,
    PantallaCargaComponent,
    AlertInfoComponent
  ],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginForm: FormGroup;
  errorMessage: string = '';
  isAlertVisible: boolean = false;
  alertType: AlertType = 'warning';
  isLoading = false;

  constructor(private authService: AuthService,private loginService:LoginService, private fb: FormBuilder, private router:Router) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      contrasenya: ['', [Validators.required]],
    });
  }

  /**
   * Función para hacer login
   */
  onSubmit() {
    if (this.loginForm.invalid) {
      alert('Por favor, completa el formulario correctamente.');
      return;
    }

    this.isLoading = true;

    this.loginService.login(this.loginForm.value).subscribe({
      next: (response) => {
        if (response.token) {
          this.authService.setToken(response.token);
          window.location.href = this.authService.isAdmin() ? '/admin' : '/main';

        } else {
          this.errorMessage = response.info;
          this.isAlertVisible = true;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Error al hacer login. Por favor, inténtalo de nuevo.';
        this.isAlertVisible = true;
      },
    });
    setTimeout(() => {
      this.isAlertVisible = false;
    }, 2000);
  }


}
