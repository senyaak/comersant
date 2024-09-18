import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandComponent } from './land.component';

describe('LandComponent', () => {
  let component: LandComponent;
  let fixture: ComponentFixture<LandComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LandComponent]
    });
    fixture = TestBed.createComponent(LandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
