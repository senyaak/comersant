// import { Component, DebugElement } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
// import { BehaviorSubject } from 'rxjs';

// import { GameService } from '../services/game.service';
// import { FrozenWhenPausedDirective } from './frozen-when-paused.directive';

// @Component({
//   template: '<div app-frozen-when-paused id="test-element">Test Content</div>',
// })
// class TestComponent {}

// describe('FrozenWhenPausedDirective', () => {
//   let fixture: ComponentFixture<TestComponent>;
//   let element: DebugElement;
//   let pausedSubject: BehaviorSubject<boolean>;
//   let gameServiceMock: jasmine.SpyObj<GameService>;

//   beforeEach(() => {
//     pausedSubject = new BehaviorSubject<boolean>(false);
//     gameServiceMock = jasmine.createSpyObj('GameService', [], {
//       Paused$: pausedSubject.asObservable(),
//     });

//     TestBed.configureTestingModule({
//       declarations: [FrozenWhenPausedDirective, TestComponent],
//       providers: [
//         { provide: GameService, useValue: gameServiceMock },
//       ],
//     });

//     fixture = TestBed.createComponent(TestComponent);
//     element = fixture.debugElement.query(By.css('#test-element'));
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(element).toBeTruthy();
//   });

//   it('should add frozen class when game is paused', () => {
//     pausedSubject.next(true);
//     fixture.detectChanges();

//     expect(element.nativeElement.classList.contains('frozen')).toBe(true);
//   });

//   it('should remove frozen class when game is not paused', () => {
//     pausedSubject.next(true);
//     fixture.detectChanges();
//     expect(element.nativeElement.classList.contains('frozen')).toBe(true);

//     pausedSubject.next(false);
//     fixture.detectChanges();
//     expect(element.nativeElement.classList.contains('frozen')).toBe(false);
//   });

//   it('should create ice overlay when paused', () => {
//     pausedSubject.next(true);
//     fixture.detectChanges();

//     const overlay = element.nativeElement.querySelector('.ice-overlay');
//     expect(overlay).toBeTruthy();
//   });

//   it('should remove ice overlay when unpaused', () => {
//     pausedSubject.next(true);
//     fixture.detectChanges();
//     let overlay = element.nativeElement.querySelector('.ice-overlay');
//     expect(overlay).toBeTruthy();

//     pausedSubject.next(false);
//     fixture.detectChanges();
//     overlay = element.nativeElement.querySelector('.ice-overlay');
//     expect(overlay).toBeFalsy();
//   });

//   it('should create 3 ice crystals in overlay', () => {
//     pausedSubject.next(true);
//     fixture.detectChanges();

//     const crystals = element.nativeElement.querySelectorAll('.ice-crystal');
//     expect(crystals.length).toBe(3);
//   });

//   it('should create ice shine in overlay', () => {
//     pausedSubject.next(true);
//     fixture.detectChanges();

//     const shine = element.nativeElement.querySelector('.ice-shine');
//     expect(shine).toBeTruthy();
//   });
// });
