import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxServiceComponent } from './tax-service.component';

describe('TaxServiceComponent', () => {
  let component: TaxServiceComponent;
  let fixture: ComponentFixture<TaxServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TaxServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaxServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
