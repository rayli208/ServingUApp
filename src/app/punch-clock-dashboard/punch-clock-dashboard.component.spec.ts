import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PunchClockDashboardComponent } from './punch-clock-dashboard.component';

describe('PunchClockDashboardComponent', () => {
  let component: PunchClockDashboardComponent;
  let fixture: ComponentFixture<PunchClockDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PunchClockDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PunchClockDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
