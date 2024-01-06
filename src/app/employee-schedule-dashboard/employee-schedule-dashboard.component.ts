import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ScheduleService } from './../_services/schedule.service';
import { EmployeesService } from './../_services/employees.service';
import { Schedule } from '../_models/schedule.model';
import { EditScheduleDialogComponent } from '../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-employee-schedule-dashboard',
  templateUrl: './employee-schedule-dashboard.component.html',
  styleUrls: ['./employee-schedule-dashboard.component.scss']
})
export class EmployeeScheduleDashboardComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  employeeRef: any;
  Schedules: any[] = [];
  allSchedules: any[] = [];

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  constructor(
    private _snackBar: MatSnackBar,
    public act: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    public employeesService: EmployeesService,
    public scheduleService: ScheduleService,
  ) {}

  ngOnInit(): void {
    const id = this.act.snapshot.paramMap.get('id');

    this.employeesService.getEmployeeDoc(id).subscribe(res => {
      this.employeeRef = res;
    });

    this.scheduleService.getSchedulesListForEmployee(id).subscribe(res => {
      this.allSchedules = res.map(e => {
        return {
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Schedule)
        } as Schedule;
      }).sort((a, b) => {
        // Sort by date in ascending order
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    });
  }

  seeSchedules(): void {
    const startDate = this.range.value.start;
    const endDate = this.range.value.end;

    if (startDate && endDate) {
      this.Schedules = this.allSchedules.filter(schedule => {
        const scheduleDate = new Date(schedule.date);
        return scheduleDate >= new Date(startDate) && scheduleDate <= new Date(endDate);
      });
    }
  }

  editSchedule(schedule: Schedule) {
    const dialogRef = this.dialog.open(EditScheduleDialogComponent, {
      data: schedule
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Find the index of the edited schedule
        const index = this.Schedules.findIndex(s => s.id === result.id);
        if (index !== -1) {
          // Update the Schedules array with the edited schedule
          this.Schedules[index] = result;
        }
  
        // Do the same for allSchedules if needed
        const allIndex = this.allSchedules.findIndex(s => s.id === result.id);
        if (allIndex !== -1) {
          this.allSchedules[allIndex] = result;
        }
  
        this._snackBar.open('Schedule has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      }
    });
  }
  
  deleteSchedule(schedule: Schedule) {
    const employeeName = this.employeeRef?.name || 'Unknown Employee';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete ${employeeName}'s schedule?`
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.deleteSchedule(schedule).then(() => {
          // Remove the deleted schedule from the Schedules array.
          this.Schedules = this.Schedules.filter(s => s.id !== schedule.id);
          // Remove the deleted schedule from the allSchedules array as well.
          this.allSchedules = this.allSchedules.filter(s => s.id !== schedule.id);
  
          this._snackBar.open('Schedule has been deleted!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
      }
    });
  }
  
  backToSchedule() {
    this.router.navigate(['employee-dashboard']);
  }
}
