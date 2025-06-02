import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecetaService} from '../../services/receta.service';
import { EncryptService } from '../../../../core/services/encrypt.service';

@Component({
  selector: 'app-preview-receta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './preview-receta.component.html',
  styleUrls: ['./preview-receta.component.css']
})
export class PreviewRecetaComponent implements OnInit {
  @Input() idRecetaEncriptado: string = '';
  receta: any = null;
  error = '';
  rutaDestino = '';

  private recetaService = inject(RecetaService);
  private encryptService = inject(EncryptService);

  ngOnInit(): void {
    try {
      const idReal = this.encryptService.desencriptar(this.idRecetaEncriptado);
      if (idReal) {
        this.rutaDestino = `/receta/${this.idRecetaEncriptado}`;
        this.recetaService.getInfoReceta(idReal).subscribe({
          next: (data) => this.receta = data,
          error: () => this.error = 'Error al cargar la receta'
        });
      }
    } catch (e) {
      this.error = 'ID de receta inválido';
    }
  }
}
