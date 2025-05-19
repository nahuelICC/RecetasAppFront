import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RecetasExploradorDTO} from '../../models/RecetasExploradorDTO';
import {DuracionSinSegundosPipe} from '../../pipes/duracion-sin-segundos.pipe';
import {RouterLink} from '@angular/router';
import {DecimalPipe, NgIf} from '@angular/common';
import {RecetaService} from '../../services/receta.service';

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

  constructor(private recetaService: RecetaService) { }

  ngOnInit() {}
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
}
