import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PreviewRecetaComponent } from './preview-receta.component';

describe('PreviewRecetaComponent', () => {
  let component: PreviewRecetaComponent;
  let fixture: ComponentFixture<PreviewRecetaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PreviewRecetaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewRecetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
