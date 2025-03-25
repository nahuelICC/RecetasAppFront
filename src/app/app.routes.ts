import { Routes } from '@angular/router';
import { RecetaViewComponent } from './features/receta-view/receta-view.component';
import { RegistroComponent } from './features/registro/registro.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { ActivacionComponent } from './features/registro/components/activacion/activacion.component';

export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'main', component: InicioComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'receta', component: RecetaViewComponent },
];
