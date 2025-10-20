import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterCenterComponent } from './enter-center.component';

describe('EnterCenterComponent', () => {
  let component: EnterCenterComponent;
  let fixture: ComponentFixture<EnterCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterCenterComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(EnterCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
