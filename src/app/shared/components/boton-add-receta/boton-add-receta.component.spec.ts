import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonAddRecetaComponent } from './boton-add-receta.component';

describe('BotonAddRecetaComponent', () => {
  let component: BotonAddRecetaComponent;
  let fixture: ComponentFixture<BotonAddRecetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonAddRecetaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonAddRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
