import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';
import { ScheduleService } from '../_services/schedule.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PunchClockBottomSheetComponent } from '../_bottom-sheets/punch-clock/punch-clock-bottom-sheet/punch-clock-bottom-sheet.component';
import { TimeStampService } from '../_services/time-stamp.service';

@Component({
  selector: 'app-punch-clock-dashboard',
  templateUrl: './punch-clock-dashboard.component.html',
  styleUrls: ['./punch-clock-dashboard.component.scss']
})
export class PunchClockDashboardComponent implements OnInit, OnDestroy {

  userId;
  user: Observable<any>;
  Employees = [];
  today = new Date();
  dateStr = this.today.toISOString().slice(0, 10);
  clockInTimes: Map<string, string> = new Map();
  Schedules: any[];
  currentTime: string;
  private destroy$ = new Subject<void>();

  constructor(
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
    public scheduleService: ScheduleService,
    private matBottomSheet: MatBottomSheet
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.employeesService.getEmployeesListForUser(this.userId).subscribe((employees) => {
          this.Employees = employees.map((employee) => {
            const employeeData = employee.payload.doc.data();
            return { id: employee.payload.doc.id, ...(employeeData as object) } as Employee;
          }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        });
      }
    });

    this.updateCurrentTime();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTriggerSheetClick(employee: Employee) {
    this.matBottomSheet.open(
      PunchClockBottomSheetComponent,
      {
        data: employee
      });
  }

  updateCurrentTime(): void {
    interval(1000)
      .pipe(
        map(() => this.datePipe.transform(new Date(), 'shortTime')),
        takeUntil(this.destroy$)
      )
      .subscribe((time) => {
        this.currentTime = time;
      });
  }

  formatClockInTime(seconds: number): string {
    const date = new Date(seconds * 1000);
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  }  
}
