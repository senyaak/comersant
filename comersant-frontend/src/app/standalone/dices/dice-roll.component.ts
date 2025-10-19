import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { interval, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

type Die = {
  final: number; // 1..6
  current: number; // текущая грань (меняется во время ролла)
  rolling: boolean; // для CSS-анимации
};

@Component({
  selector: 'app-dice-roll',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dice-roll.component.html',
  styleUrls: ['./dice-roll.component.scss'],
})
export class DiceRollComponent implements OnInit, OnDestroy {
  /** Выпавшие значения 1..6, длина 1–3 */
  @Input() set values(v: number[]) {
    const n = Math.min(3, Math.max(1, v?.length ?? 1));
    const trimmed = (v ?? []).slice(0, n).map(x => this.clampFace(x));
    this._dice.set(trimmed.map(f => ({ final: f, current: this.randFaceNot(f), rolling: false })));
    this._visible.set(true);
  }

  /** Размер одного кубика (px) */
  @Input() size = 80;
  /** Отступ между кубиками (px) */
  @Input() gap = 16;
  /** Длительность активного ролла (мс) */
  @Input() rollMs = 1200;
  /** Частота смены грани во время ролла (мс) */
  @Input() tickMs = 80;
  /** Длительность фейда после остановки (мс) */
  @Input() fadeMs = 500;
  /** Автостарт при установке values */
  @Input() autoStart = true;

  /** Событие полного окончания (после фейда) */
  @Output() done = new EventEmitter<void>();

  // координаты точек относительно size
  r = 6; // радиус точки (скорректируется в ngOnInit под size)
  c = 0; q1 = 0; q3 = 0;

  // внутреннее состояние (signals)
  private _dice = signal<Die[]>([]);
  dice = this._dice.asReadonly();

  private _visible = signal<boolean>(false);
  visible = this._visible.asReadonly();

  private _fading = signal<boolean>(false);
  fading = this._fading.asReadonly();

  svgWidth = computed(() => this._dice().length * this.size + Math.max(0, this._dice().length - 1) * this.gap);

  // вспомогательные
  rollStepMs = 260; // длительность одного “шага” CSS-анимации

  private destroy$ = new Subject<void>();
  private rolling$ = new Subject<void>();

  ngOnInit() {
    // масштаб пипсов под size
    const unit = this.size / 6;
    this.r = Math.max(3, Math.round(this.size * 0.07));
    this.c = this.size / 2;
    this.q1 = this.size / 2 - unit * 1.5;
    this.q3 = this.size / 2 + unit * 1.5;

    if (this.autoStart && this._dice().length) this.start();
  }

  ngOnDestroy() {
    this.destroy$.next(); this.destroy$.complete();
  }

  /** Запустить анимацию броска */
  start() {
    if (!this._dice().length) return;

    // старт тряски
    this._dice.update(d => d.map(x => ({ ...x, rolling: true })));
    this._fading.set(false);
    this._visible.set(true);

    // во время ролла меняем грани на случайные
    interval(this.tickMs).pipe(takeUntil(timer(this.rollMs)), takeUntil(this.destroy$)).subscribe(() => {
      this._dice.update(d => d.map(x => ({ ...x, current: this.randFaceNot(x.current) })));
    });

    // остановка ролла -> фиксируем финальные значения
    timer(this.rollMs).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this._dice.update(d => d.map(x => ({ ...x, rolling: false, current: x.final })));
      // фейд-аут
      // даём кадр на перерисовку финальных граней
      requestAnimationFrame(() => {
        this._fading.set(true);
        // скрыть после фейда
        timer(this.fadeMs).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this._visible.set(false);
          this.done.emit();
        });
      });
    });
  }

  /** Спрятать немедленно */
  hide() {
    this._visible.set(false);
  }

  /** Сменить данные и перезапустить */
  rollTo(values: number[]) {
    this.values = values;
    this.start();
  }

  /** no-op хук, иногда полезен для Safari с SVG анимациями */
  noop() {}

  private clampFace(n: number) {
    return Math.min(6, Math.max(1, Math.floor(n || 1)));
  }

  private randFace() { return 1 + Math.floor(Math.random() * 6); }
  private randFaceNot(not: number) {
    let f = this.randFace();
    if (f === not) f = ((f % 6) + 1);
    return f;
  }
}
