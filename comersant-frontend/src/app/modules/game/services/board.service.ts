import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class BoardService {
  private _lastClickedCell$ = new BehaviorSubject<number>(-1);

  // Public observable for subscribers
  get lastClickedCell$(): Observable<number> {
    return this._lastClickedCell$.asObservable();
  }

  onCellClick(cellIndex: number): void {
    this._lastClickedCell$.next(cellIndex);
  }
}
