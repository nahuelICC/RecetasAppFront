import { Routes } from '@angular/router';
import { RecetaViewComponent } from './features/receta-view/receta-view.component';
import { RegistroComponent } from './features/registro/registro.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { ActivacionComponent } from './features/registro/components/activacion/activacion.component';
import {LoginComponent} from './features/login/login.component';
import {UsuarioComponent} from './features/usuario/usuario.component';
import { CrearRecetaComponent } from './features/crear-receta/crear-receta.component'; // Import added


export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'main', component: InicioComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'receta/:id', component: RecetaViewComponent },
  { path: 'login', component: LoginComponent},
  {path: 'main', component: InicioComponent},
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: 'perfil', component: UsuarioComponent},
  {path: 'perfil/:id', component: UsuarioComponent},
  {path: 'crear-receta', component: CrearRecetaComponent }

];
