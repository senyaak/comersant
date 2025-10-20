import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnControlComponent } from './turn-control.component';

describe('TurnControlComponent', () => {
  let component: TurnControlComponent;
  let fixture: ComponentFixture<TurnControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurnControlComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(TurnControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
