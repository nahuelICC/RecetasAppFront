import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NutriscoreComponent } from './nutriscore.component';

describe('NutriscoreComponent', () => {
  let component: NutriscoreComponent;
  let fixture: ComponentFixture<NutriscoreComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NutriscoreComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NutriscoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
