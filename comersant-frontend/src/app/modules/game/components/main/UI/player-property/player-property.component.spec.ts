import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerPropertyComponent } from './player-property.component';

describe('PlayerPropertyComponent', () => {
  let component: PlayerPropertyComponent;
  let fixture: ComponentFixture<PlayerPropertyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerPropertyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerPropertyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
