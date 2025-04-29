import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CuadroRecetaGuardadaComponent } from './cuadro-receta-guardada.component';

describe('CuadroRecetaGuardadaComponent', () => {
  let component: CuadroRecetaGuardadaComponent;
  let fixture: ComponentFixture<CuadroRecetaGuardadaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CuadroRecetaGuardadaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CuadroRecetaGuardadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
