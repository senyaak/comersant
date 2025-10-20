import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RacittoComponent } from './racitto.component';

describe('RacittoComponent', () => {
  let component: RacittoComponent;
  let fixture: ComponentFixture<RacittoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RacittoComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(RacittoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
