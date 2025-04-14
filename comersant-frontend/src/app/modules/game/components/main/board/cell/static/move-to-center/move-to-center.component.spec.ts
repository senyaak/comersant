import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveToCenterComponent } from './move-to-center.component';

describe('MoveToCenterComponent', () => {
  let component: MoveToCenterComponent;
  let fixture: ComponentFixture<MoveToCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MoveToCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveToCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
