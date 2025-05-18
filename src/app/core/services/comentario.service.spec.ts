/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { ComentarioService } from './comentario.service';

describe('Service: Comentario', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ComentarioService]
    });
  });

  it('should ...', inject([ComentarioService], (service: ComentarioService) => {
    expect(service).toBeTruthy();
  }));
});
