import {Routes} from '@angular/router';
import {RegistroComponent} from './features/registro/registro.component';
import {InicioComponent} from './features/inicio/inicio.component';

export const routes: Routes = [
  {path: 'registro', component: RegistroComponent},
  {path: 'main', component: InicioComponent},
];
