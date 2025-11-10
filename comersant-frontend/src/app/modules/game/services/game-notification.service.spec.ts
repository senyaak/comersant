import { TestBed } from '@angular/core/testing';

import { GameNotificationService } from './game-notification.service';

describe('GameNotificationService', () => {
  let service: GameNotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
