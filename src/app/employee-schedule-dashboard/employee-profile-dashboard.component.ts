import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ScheduleService } from '../_services/schedule.service';
import { EmployeesService } from '../_services/employees.service';
import { Schedule } from '../_models/schedule.model';
import { EditScheduleDialogComponent } from '../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { FormGroup, FormControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TimeoffService } from '../_services/timeoff.service';
import { Timeoff } from '../_models/timeoff.model';
import { MatCalendar } from '@angular/material/datepicker';

@Component({
  selector: 'app-employee-profile-dashboard',
  templateUrl: './employee-profile-dashboard.component.html',
  styleUrls: ['./employee-profile-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmployeeProfileDashboardComponent implements OnInit {
  @ViewChild('timeOffCalendar') timeOffCalendar: MatCalendar<Date>;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  public userId: string;
  employeeId = this.act.snapshot.paramMap.get('id');
  viewMode = 'schedule';
  employeeRef: any;
  Schedules: any[] = [];
  allSchedules: any[] = [];
  daysSelected: string[] = [];
  loadedTimeOffs: string[] = [];
  searchedTimeOffs: Timeoff[] = [];
  searchPerformed = false; 

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  timeOffRange = new FormGroup({
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
    private afAuth: AngularFireAuth,
    private timeoffService: TimeoffService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
      }
    });

    this.employeesService.getEmployeeDoc(this.employeeId).subscribe(res => {
      this.employeeRef = res;
      this.noteForm.get('note').setValue(this.employeeRef.note); // Set the note in the form
    });
  

    this.employeesService.getEmployeeDoc(this.employeeId).subscribe(res => {
      this.employeeRef = res;
    });

    this.scheduleService.getSchedulesListForEmployee(this.employeeId).subscribe(res => {
      this.allSchedules = res.map(e => {
        return {
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Schedule)
        } as Schedule;
      }).sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
    });

    this.noteForm = new FormGroup({
      note: new FormControl('') // Initialize with an empty string or fetch existing note if available
    });

    // Load and all the time offs for the employee
    this.loadAndLogEmployeeTimeOffs();
  }

  loadAndLogEmployeeTimeOffs(): void {
    if (!this.employeeId) {
      console.error('Employee ID is not available.');
      return;
    }

    this.timeoffService.getTimeoffListForEmployee(this.employeeId).subscribe(res => {
      const timeOffs = res.map(e => {
        return {
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Timeoff)
        };
      });

      // Store the fetched time off dates
      this.loadedTimeOffs = timeOffs.map(timeOff => timeOff.date);
    }, error => {
      console.error('Error loading time offs:', error);
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

  isSelected = (date: Date): string | null => {
    const dateString = this.formatDate(date);
    if (this.daysSelected.includes(dateString)) {
      return 'selected'; // Your existing class for selected dates
    } else if (this.loadedTimeOffs.includes(dateString)) {
      return 'timeoff-loaded'; // A new class for loaded time off dates
    }
    return null;
  };

  selectDate(event: Date, calendar: any): void {
    const dateString = this.formatDate(event);
    const index = this.daysSelected.indexOf(dateString);
    if (index < 0) {
      this.daysSelected.push(dateString);
    } else {
      this.daysSelected.splice(index, 1); // Allows toggling a date
    }

    // Force the calendar to refresh its view
    this.timeOffCalendar.updateTodaysDate();
  }

  deleteDate(date: string): void {
    const index = this.daysSelected.indexOf(date);
    if (index >= 0) {
      this.daysSelected.splice(index, 1);

      // Refresh the calendar to update the highlighting
      if (this.timeOffCalendar) {
        this.timeOffCalendar.updateTodaysDate();
      }
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  saveTimeOff(): void {
    if (this.daysSelected.length === 0) {
      return; // Ensuring there are selected dates
    }
    
    // Create an array of time-off objects
    const timeOffsToSave: Timeoff[] = this.daysSelected.map(date => ({
      date,
      employeeId: this.employeeId,
      uid: this.userId
    }));
  
    // Save the batch of time-offs
    this.timeoffService.saveBatchTimeoffs(timeOffsToSave)
      .then(() => {  
        // Update loadedTimeOffs with new dates and ensure no duplicates
        this.loadedTimeOffs = [...new Set([...this.loadedTimeOffs, ...this.daysSelected])];
  
        // Clear the selected dates after saving
        this.daysSelected = [];
  
        // Force calendar refresh if it's open and force change detection
        if (this.timeOffCalendar) {
          this.timeOffCalendar.updateTodaysDate();
          this.changeDetectorRef.detectChanges();
        }
          this.showSuccessSnackbar("Time off has been saved!");
      })
      .catch(error => {
        console.error('Error saving time off:', error);
      });
  }
  
  saveNote(): void {
    const id = this.act.snapshot.paramMap.get('id');
    const note = this.noteForm.get('note').value;
  
    this.employeesService.updateEmployeeNote(id, note).then(() => {
      this._snackBar.open('Note has been saved!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['green-snackbar']
      });
  
      // Update the form with the new note value
      this.noteForm.get('note').setValue(note);
  
      // Optionally, also update the local employeeRef object if you're using it elsewhere
      if (this.employeeRef) {
        this.employeeRef.note = note;
      }
  
    }).catch(error => {
      console.error('Error saving note:', error);
    });
  }  

  backToSchedule() {
    this.router.navigate(['employee-dashboard']);
  }

  showSuccessSnackbar(message: string): void {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: ['green-snackbar']
    });
  }

  searchTimeOffs(): void {
    const startDate = this.timeOffRange.value.start;
    const endDate = this.timeOffRange.value.end;

    if (startDate && endDate) {
      this.searchPerformed = true;
      this.timeoffService.getTimeoffsInRange(this.employeeId, startDate, endDate).subscribe(res => {
        this.searchedTimeOffs = res.map(e => ({ id: e.payload.doc.id, ...e.payload.doc.data() as Timeoff }));
      });
    }
  }

  confirmTimeOffDeletion(timeOff: Timeoff): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete this time off request for ${timeOff.date}?`
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.timeoffService.deleteTimeoff(timeOff).then(() => {
          // Remove the deleted time off date from loadedTimeOffs
          this.loadedTimeOffs = this.loadedTimeOffs.filter(date => date !== timeOff.date);
  
          // Update searchedTimeOffs to exclude the deleted time off
          this.searchedTimeOffs = this.searchedTimeOffs.filter(to => to.id !== timeOff.id);
  
          // Show success message
          this._snackBar.open('Time off has been deleted!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
  
          // Refresh the calendar to update the highlighting
          if (this.timeOffCalendar) {
            this.timeOffCalendar.updateTodaysDate();
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    });
  }  
}
