import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkipTurnComponent } from './skip-turn.component';

describe('SkipTurnComponent', () => {
  let component: SkipTurnComponent;
  let fixture: ComponentFixture<SkipTurnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SkipTurnComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(SkipTurnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
