import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ScheduleService } from '../_services/schedule.service';
import { EmployeesService } from '../_services/employees.service';
import { Schedule } from '../_models/schedule.model';
import { EditScheduleDialogComponent } from '../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-employee-profile-dashboard',
  templateUrl: './employee-profile-dashboard.component.html',
  styleUrls: ['./employee-profile-dashboard.component.scss']
})
export class EmployeeProfileDashboardComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  viewMode = 'schedule';
  employeeRef: any;
  Schedules: any[] = [];
  allSchedules: any[] = [];

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  noteForm: FormGroup;

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

    this.noteForm = new FormGroup({
      note: new FormControl('') // Initialize with an empty string or fetch existing note if available
    });

    // Fetch the note for the employee if it exists and populate the form
    this.employeesService.getEmployeeDoc(id).subscribe(res => {
      this.employeeRef = res;
      this.noteForm.get('note').setValue(this.employeeRef.note || ''); // Set the note if it exists
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

  saveNote(): void {
    const id = this.act.snapshot.paramMap.get('id');
    const note = this.noteForm.get('note').value;
    this.employeesService.updateEmployeeNote(id, note).then(() => {
      // Handle success, such as showing a confirmation message
      this._snackBar.open('Note has been saved!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['green-snackbar']
      });
    }).catch(error => {
      // Handle error
      console.error('Error saving note:', error);
    });
  }
  
  backToSchedule() {
    this.router.navigate(['employee-dashboard']);
  }
}
