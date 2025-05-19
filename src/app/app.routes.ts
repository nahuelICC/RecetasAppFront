import { Routes } from '@angular/router';
import { RecetaViewComponent } from './features/receta-view/receta-view.component';
import { RegistroComponent } from './features/registro/registro.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { ActivacionComponent } from './features/registro/components/activacion/activacion.component';
import {LoginComponent} from './features/login/login.component';
import {ExploradorComponent} from './features/explorador/explorador.component';
import {UsuarioComponent} from './features/usuario/usuario.component';
import { CrearRecetaComponent } from './features/crear-receta/crear-receta.component';
import {AdminComponent} from './features/admin/admin.component';
import {NutriscoreComponent} from './features/nutriscore/nutriscore.component';
import {EscanerComponent} from './features/nutriscore/components/escaner/escaner.component';
import {ChatComponent} from './features/chat/chat.component'; // Import added


export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'main', component: InicioComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'receta/:id', component: RecetaViewComponent },
  { path: 'login', component: LoginComponent},
  {path: 'explorador', component: ExploradorComponent},
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: 'perfil', component: UsuarioComponent},
  {path: 'perfil/:id', component: UsuarioComponent},
  {path: 'crear-receta', component: CrearRecetaComponent },
  {path: 'nutriscore', component: NutriscoreComponent },
  {path: 'nutriscore/escaner', component: EscanerComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'chat/:id', component: ChatComponent },
  {path: 'crear-receta', component: CrearRecetaComponent },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {path: "**", redirectTo: 'main', pathMatch: 'full'},
];
