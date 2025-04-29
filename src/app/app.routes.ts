import { Routes } from '@angular/router';
import {RegistroComponent} from './features/registro/registro.component';
import {InicioComponent} from './features/inicio/inicio.component';
import {ActivacionComponent} from './features/registro/components/activacion/activacion.component';
import {LoginComponent} from './features/login/login.component';
import {ExploradorComponent} from './features/explorador/explorador.component';

export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent },
  { path: 'login', component: LoginComponent},
  {path: 'main', component: InicioComponent},
  {path: 'explorador', component: ExploradorComponent}
];
