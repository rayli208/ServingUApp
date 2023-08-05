import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TimeStamp } from 'src/app/_models/time-stamp.model';
import { TimeStampService } from 'src/app/_services/time-stamp.service';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { EditTimestampDialogComponent } from 'src/app/_dialogs/hours/edit-timestamp-dialog/edit-timestamp-dialog.component';
import { CreateTimestampDialogComponent } from 'src/app/_dialogs/hours/create-timestamp-dialog/create-timestamp-dialog.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-hours-dashboard',
  templateUrl: './hours-dashboard.component.html',
  styleUrls: ['./hours-dashboard.component.scss']
})
export class HoursDashboardComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  isEmpty: boolean = true;
  timestamps = [];
  originalTimestamps = [];
  totalHours: { [key: string]: number } = {};
  selectedEmployee: string | null = null;

  userId: string;

  constructor(private timeStampService: TimeStampService, private afAuth: AngularFireAuth, private dialog: MatDialog, private _snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
    });
  }

  isRangeValid() {
    return this.range.controls.start.value && this.range.controls.end.value;
  }

  loadTimestamps() {
    this.timestamps = [];

    if (this.range.valid) {
      let startDate = this.range.controls.start.value;
      let endDate = this.range.controls.end.value;

      if (!startDate) {
        alert('Start date is not selected.');
        return;
      }

      if (endDate) {
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
      } else {
        alert('End date is not selected.');
        return;
      }

      this.timeStampService.getTimeStampsForUserAndDateRange(this.userId, startDate, endDate)
        .subscribe((res) => {
          this.originalTimestamps = res.map((e) => {
            const data = e.payload.doc.data() as any;
            const hoursWorked = (data.endTime.toDate() - data.startTime.toDate()) / (1000 * 60 * 60);
            return {
              id: e.payload.doc.id,
              uid: data.uid,
              employeeId: data.employeeId,
              employeeName: data.employeeName,
              startTime: data.startTime.toDate(),
              endTime: data.endTime.toDate(),
              hoursWorked: hoursWorked.toFixed(2)
            } as TimeStamp;
          });

          if (this.originalTimestamps.length === 0) {
            this.isEmpty = true;
          } else {
            this.isEmpty = false;
          }

          this.calculateTotalHours();

          // Check if an employee is selected and filter the timestamps for that employee
          if (this.selectedEmployee) {
            this.selectEmployee(this.selectedEmployee);
          }
        });

      this._snackBar.open('Timestamps Loaded!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['green-snackbar']
      });
    } else {
      alert('Please select a valid date range.');
    }
  }

  selectEmployee(employeeName: string) {
    this.selectedEmployee = employeeName;
    this.timestamps = this.originalTimestamps.filter(timestamp => timestamp.employeeName === this.selectedEmployee);
  }

  calculateTotalHours() {
    this.totalHours = {};

    this.originalTimestamps.forEach(timestamp => {
      if (!this.totalHours[timestamp.employeeName]) {
        this.totalHours[timestamp.employeeName] = 0;
      }
      this.totalHours[timestamp.employeeName] += parseFloat(timestamp.hoursWorked);
    });

    for (let employee in this.totalHours) {
      this.totalHours[employee] = parseFloat(this.totalHours[employee].toFixed(2));
    }
  }

  exportToExcel() {
    if (!this.isRangeValid() || this.originalTimestamps.length === 0) {
      alert('Please select a valid date range with available timestamps.');
      return;
    }

    let allTimestamps: any[][] = [];
    let totalHours: any[][] = [];

    // Header for "All Schedules" sheet
    allTimestamps.push(["Employee Name", "Date", "Start Time", "End Time", "Hours Worked"]);

    // Header for "Total Hours" sheet
    totalHours.push(["Employee Name", "Total Hours"]);

    // Sort timestamps by employee name and start time
    this.originalTimestamps.sort((a, b) => (a.employeeName > b.employeeName) ? 1 : (a.employeeName === b.employeeName) ? ((a.startTime > b.startTime) ? 1 : -1) : -1);

    this.originalTimestamps.forEach((timestamp) => {
      let startDate = new Date(timestamp.startTime);
      let endDate = new Date(timestamp.endTime);

      // Format the dates and times
      let date = startDate.toLocaleDateString();
      let startTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let endTime = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      allTimestamps.push([timestamp.employeeName, date, startTime, endTime, timestamp.hoursWorked]);
    });

    for (let employeeName in this.totalHours) {
      totalHours.push([employeeName, this.totalHours[employeeName]]);
    }

    const wb = XLSX.utils.book_new();
    const ws_all = XLSX.utils.aoa_to_sheet(allTimestamps);
    const ws_total = XLSX.utils.aoa_to_sheet(totalHours);

    XLSX.utils.book_append_sheet(wb, ws_all, "All Schedules");
    XLSX.utils.book_append_sheet(wb, ws_total, "Total Hours");

    // Format the filename with the selected date range
    let filename = `Employee Hours (${this.range.controls.start.value.toLocaleDateString()} - ${this.range.controls.end.value.toLocaleDateString()}).xlsx`;
    filename = filename.replace(/ /g, "_").replace(/_-\_/g, "-").replace(/\//g, "-");

    XLSX.writeFile(wb, filename);

    this._snackBar.open('Generated Excel File!', '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: ['green-snackbar']
    });
  }

  convertDate(firebaseTimestamp: any): Date {
    const dateObject = new Date(`${firebaseTimestamp.months} ${firebaseTimestamp.days}, ${firebaseTimestamp.years}`);
    return dateObject;
  }

  confirmDelete(timestampId: string) {
    const confirmDeletion = confirm("Are you sure you want to delete this timestamp?");
    if (confirmDeletion) {
      this.timeStampService.deleteTimeStamp(timestampId).then(() => {
        this.loadTimestamps(); // reload the timestamps after deletion
        this._snackBar.open('Deleted timestamp!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      }).catch((error) => {
        console.error("Error deleting timestamp: ", error);
      });
    }
  }

  openEditDialog(timestamp: TimeStamp) {
    const dialogRef = this.dialog.open(EditTimestampDialogComponent, {
      width: '400px',
      data: { timestamp }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        timestamp.startTime = result.startTime;
        timestamp.endTime = result.endTime;
        this.timeStampService.updateTimeStamp(timestamp, timestamp.id);
        this._snackBar.open('Timestamps edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      }
    });
  }

  openCreateDialog() {
    const dialogRef = this.dialog.open(CreateTimestampDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload timestamps if the selected employee's timestamps are being displayed
        if (this.selectedEmployee) {
          this.loadTimestamps();
        }
        this._snackBar.open('Timestamp has been created!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      }
    });
  }
}
