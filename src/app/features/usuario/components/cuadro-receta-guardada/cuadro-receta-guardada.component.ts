import {Component, Input, NgZone, OnInit} from '@angular/core';
import {IonIcon} from '@ionic/angular/standalone';
import {Router, RouterLink} from '@angular/router';
import { EncryptService } from '../../../../core/services/encrypt.service';

@Component({
  selector: 'app-cuadro-receta-guardada',
  templateUrl: './cuadro-receta-guardada.component.html',
  styleUrls: ['./cuadro-receta-guardada.component.css'],
  standalone: true,
  imports: [IonIcon, RouterLink]
})
export class CuadroRecetaGuardadaComponent  implements OnInit {

  constructor(
    private router: Router,
    private zone: NgZone,
    private encryptService: EncryptService
  ) { }

  ngOnInit() {}

  @Input() receta!: {
    nombre: string;
    fotoReceta: string;
    tiempo: string;
    idReceta: string;
  };

  redireccionarReceta(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

}
