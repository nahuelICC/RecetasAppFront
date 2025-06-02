import { Routes } from '@angular/router';
import { RecetaViewComponent } from './features/receta-view/receta-view.component';
import { RegistroComponent } from './features/registro/registro.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { ActivacionComponent } from './features/registro/components/activacion/activacion.component';
import { LoginComponent } from './features/login/login.component';
import { ExploradorComponent } from './features/explorador/explorador.component';
import { UsuarioComponent } from './features/usuario/usuario.component';
import { CrearRecetaComponent } from './features/crear-receta/crear-receta.component';
import { AdminComponent } from './features/admin/admin.component';
import { NutriscoreComponent } from './features/nutriscore/nutriscore.component';
import { EscanerComponent } from './features/nutriscore/components/escaner/escaner.component';
import { ChatComponent } from './features/chat/chat.component';
import { CambioPasswordComponent } from './features/cambio-password/cambio-password.component';
import {
  FormularioCambioPasswordComponent
} from './features/cambio-password/components/formulario-cambio-password/formulario-cambio-password.component';
import { LoginGuard } from './core/guards/login.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'registro', component: RegistroComponent },
  { path: 'activar-cuenta', component: ActivacionComponent },
  { path: 'main', component: InicioComponent, canActivate: [LoginGuard] },
  { path: 'receta/:id', component: RecetaViewComponent, canActivate: [LoginGuard] },
  { path: 'login', component: LoginComponent},
  { path: 'explorador', component: ExploradorComponent, canActivate: [LoginGuard] },
  { path: 'perfil/:id', component: UsuarioComponent, canActivate: [LoginGuard] },
  { path: 'perfil', component: UsuarioComponent, canActivate: [LoginGuard] },
  { path: 'crear-receta', component: CrearRecetaComponent, canActivate: [LoginGuard] },
  { path: 'nutriscore', component: NutriscoreComponent, canActivate: [LoginGuard] },
  { path: 'nutriscore/escaner', component: EscanerComponent, canActivate: [LoginGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [LoginGuard] },
  { path: 'chat/:id', component: ChatComponent, canActivate: [LoginGuard] },
  { path: 'crear-receta', component: CrearRecetaComponent, canActivate: [LoginGuard] },
  { path: 'cambioPassword', component: CambioPasswordComponent },
  { path: 'formResetPassword', component: FormularioCambioPasswordComponent},
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  { path: "**", redirectTo: 'main', pathMatch: 'full' },


];
