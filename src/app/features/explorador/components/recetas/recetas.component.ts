import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {RecetasExploradorDTO} from '../../models/RecetasExploradorDTO';
import {DuracionSinSegundosPipe} from '../../pipes/duracion-sin-segundos.pipe';
import {Router, RouterLink} from '@angular/router';
import {DecimalPipe, NgIf} from '@angular/common';
import {RecetaService} from '../../services/receta.service';
import {EncryptService} from '../../../../core/services/encrypt.service';

@Component({
  selector: 'app-recetas',
  templateUrl: './recetas.component.html',
  styleUrls: ['./recetas.component.css'],
  imports: [
    DuracionSinSegundosPipe,
    RouterLink,
    NgIf,
    DecimalPipe
  ],
  standalone: true
})
export class RecetasComponent  implements OnInit {
  @Input() recipeData!: RecetasExploradorDTO;
  @Input() isLiked: boolean = false;
  @Input() isSaved: boolean = false;


  // --- Outputs para notificar acciones (si la lógica la maneja el padre) ---
  @Output() likeToggled = new EventEmitter<{ recipeId: number, newState: boolean }>();
  @Output() saveToggled = new EventEmitter<{ recipeId: number, newState: boolean }>();

  constructor(private recetaService: RecetaService, private router:Router,private zone: NgZone,private encryptService:EncryptService) { }

  ngOnInit() {}

  /**
   * Maneja el evento de clic en el botón de "Me gusta" de la receta.
   * @param event
   */
  toggleLike(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Like clicked for recipe:', this.recipeData?.id);

    this.isLiked = !this.isLiked;
    this.likeToggled.emit({ recipeId: this.recipeData?.id, newState: this.isLiked });
    this.recipeData.numMeGusta = this.isLiked ? this.recipeData.numMeGusta + 1 : this.recipeData.numMeGusta - 1;

    if (this.isLiked) {
      this.recetaService.darMeGustaAReceta(this.recipeData.id).subscribe();
    } else {
      this.recetaService.eliminarMeGusta(this.recipeData.id).subscribe();
    }
  }

  /**
   * Maneja el evento de clic en el botón de "Guardar" de la receta.
   * @param event
   */
  toggleSave(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Save clicked for recipe:', this.recipeData?.id);
    this.isSaved = !this.isSaved;
    this.saveToggled.emit({ recipeId: this.recipeData?.id, newState: this.isSaved });
    this.recipeData.numGuardados = this.isSaved ? this.recipeData.numGuardados + 1 : this.recipeData.numGuardados - 1;

    if (this.isSaved) {
      this.recetaService.guardarReceta(this.recipeData.id).subscribe();
    } else {
      this.recetaService.eliminarRecetaGuardada(this.recipeData.id).subscribe();
    }
  }

  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }

  redireccionarReceta(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/receta', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }
}
