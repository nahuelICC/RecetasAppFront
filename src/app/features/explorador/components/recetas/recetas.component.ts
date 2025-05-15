import {Component, EventEmitter, Input, NgZone, OnInit, Output} from '@angular/core';
import {RecetasExploradorDTO} from '../../models/RecetasExploradorDTO';
import {DuracionSinSegundosPipe} from '../../pipes/duracion-sin-segundos.pipe';
import {Router, RouterLink} from '@angular/router';
import {DecimalPipe, NgIf} from '@angular/common';
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

  constructor(private router:Router,private zone: NgZone,private encryptService:EncryptService) { }

  ngOnInit() {}
  toggleLike(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Like clicked for recipe:', this.recipeData?.id);

    this.isLiked = !this.isLiked;
    // 2. Emite el evento para que el componente padre maneje la lógica (llamada API, etc.)
    this.likeToggled.emit({ recipeId: this.recipeData?.id, newState: this.isLiked });
    this.recipeData.numMeGusta = this.isLiked ? this.recipeData.numMeGusta + 1 : this.recipeData.numMeGusta - 1;
    // O: Llama a un servicio directamente desde aquí si prefieres
    // this.recipeService.toggleLike(this.recipeData.id).subscribe(...)
  }

  toggleSave(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Save clicked for recipe:', this.recipeData?.id);
    // 1. Cambia estado local (opcional)
    this.isSaved = !this.isSaved;
    // 2. Emite evento
    this.saveToggled.emit({ recipeId: this.recipeData?.id, newState: this.isSaved });
    this.recipeData.numGuardados = this.isSaved ? this.recipeData.numGuardados + 1 : this.recipeData.numGuardados - 1;
    // O: Llama a un servicio
    // this.recipeService.toggleSave(this.recipeData.id).subscribe(...)
  }

  redireccionarPerfil(id: string): void {
    this.zone.run(() => {
      const idEncrypt = this.encryptService.encriptar(id);
      this.router.navigate(['/perfil', idEncrypt]).then(() => {
        window.location.reload();
      });
    });
  }
}
