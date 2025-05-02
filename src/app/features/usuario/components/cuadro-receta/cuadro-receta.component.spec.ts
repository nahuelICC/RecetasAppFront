import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CuadroRecetaComponent } from './cuadro-receta.component';

describe('CuadroRecetaComponent', () => {
  let component: CuadroRecetaComponent;
  let fixture: ComponentFixture<CuadroRecetaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CuadroRecetaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CuadroRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
