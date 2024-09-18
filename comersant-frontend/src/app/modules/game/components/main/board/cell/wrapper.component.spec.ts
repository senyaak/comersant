import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CellWrapperComponent } from './wrapper.component';

describe('CellWrapperComponent', () => {
  let component: CellWrapperComponent;
  let fixture: ComponentFixture<CellWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CellWrapperComponent],
    });
    fixture = TestBed.createComponent(CellWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
