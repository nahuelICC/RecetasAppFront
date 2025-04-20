import { Routes } from '@angular/router';
import {RegistroComponent} from './features/registro/registro.component';
import {InicioComponent} from './features/inicio/inicio.component';
import {ActivacionComponent} from './features/registro/components/activacion/activacion.component';
import {LoginComponent} from './features/login/login.component';
import {UsuarioComponent} from './features/usuario/usuario.component';

export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent },
  { path: 'login', component: LoginComponent},
  {path: 'main', component: InicioComponent},
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: 'perfil', component: UsuarioComponent},
  {path: 'perfil/:id', component: UsuarioComponent},
];
