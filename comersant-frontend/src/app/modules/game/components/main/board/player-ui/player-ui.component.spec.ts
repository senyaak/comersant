import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerUIComponent } from './player-ui.component';

describe('PlayerUIComponent', () => {
  let component: PlayerUIComponent;
  let fixture: ComponentFixture<PlayerUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerUIComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
