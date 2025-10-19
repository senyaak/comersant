// import { Overlay, OverlayRef } from '@angular/cdk/overlay';
// import { ComponentPortal } from '@angular/cdk/portal';
// import { Injectable, Injector } from '@angular/core';
// import { firstValueFrom, Subject } from 'rxjs';
// import { take } from 'rxjs/operators';

// import { DiceRollComponent } from './dice-roll.component';

// export type DiceOptions = {
//   size?: number;
//   gap?: number;
//   rollMs?: number;
//   tickMs?: number;
//   fadeMs?: number;
// };

// @Injectable({ providedIn: 'root' })
// export class DiceRollService {
//   constructor(private overlay: Overlay, private injector: Injector) {}

//   /**
//    * Создаёт оверлей, проигрывает анимацию и удаляет DOM после завершения.
//    * Возвращает Promise, который резолвится по окончании фейда.
//    */
//   async roll(values: number[], opts: DiceOptions = {}): Promise<void> {
//     const overlayRef = this.createOverlay();
//     const portal = new ComponentPortal(DiceRollComponent, null, this.injector);
//     const compRef = overlayRef.attach(portal);

//     // применяем опции
//     if (opts.size != null) compRef.instance.size = opts.size;
//     if (opts.gap != null) compRef.instance.gap = opts.gap;
//     if (opts.rollMs != null) compRef.instance.rollMs = opts.rollMs;
//     if (opts.tickMs != null) compRef.instance.tickMs = opts.tickMs;
//     if (opts.fadeMs != null) compRef.instance.fadeMs = opts.fadeMs;

//     // передаём значения и запускаем
//     compRef.instance.autoStart = false;
//     compRef.instance.values = values;
//     compRef.instance.start();

//     // ждём завершения
//     const done$ = new Subject<void>();
//     compRef.instance.done.pipe(take(1)).subscribe(() => {
//       done$.next(); done$.complete();
//       // небольшой таймаут на безопасный remove (на случай кадровой задержки CSS)
//       setTimeout(() => overlayRef.dispose(), 0);
//     });

//     await firstValueFrom(done$);
//   }

//   private createOverlay(): OverlayRef {
//     return this.overlay.create({
//       hasBackdrop: false,
//       scrollStrategy: this.overlay.scrollStrategies.noop(),
//       positionStrategy: this.overlay.position()
//         .global()
//         .centerHorizontally()
//         .centerVertically(),
//       panelClass: ['dice-overlay-panel'],
//     });
//   }
// }
