import { TestBed } from '@angular/core/testing';

import { ExploradorEstadoService } from './explorador-estado.service';

describe('ExploradorEstadoService', () => {
  let service: ExploradorEstadoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExploradorEstadoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
