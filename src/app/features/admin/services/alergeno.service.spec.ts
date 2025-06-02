import { TestBed } from '@angular/core/testing';

import { AlergenoService } from './alergeno.service';

describe('AlergenoService', () => {
  let service: AlergenoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlergenoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
