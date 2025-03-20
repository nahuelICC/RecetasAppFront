import { Routes } from '@angular/router';
import { RecetaViewComponent } from './features/receta-view/receta-view.component';
import { RegistroComponent } from './features/registro/registro.component';
export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  {path: 'receta', component: RecetaViewComponent},

];
