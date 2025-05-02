import { TestBed } from '@angular/core/testing';

import { CrearRecetaService } from './crear-receta.service';

describe('CrearRecetaService', () => {
  let service: CrearRecetaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrearRecetaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
