import { Routes } from '@angular/router';
import {RegistroComponent} from './features/registro/registro.component';
import {ActivacionComponent} from './features/registro/components/activacion/activacion.component';

export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent }
];
