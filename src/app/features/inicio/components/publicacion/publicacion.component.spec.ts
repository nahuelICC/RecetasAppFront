import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PublicacionComponent } from './publicacion.component';

describe('PublicacionComponent', () => {
  let component: PublicacionComponent;
  let fixture: ComponentFixture<PublicacionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PublicacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
