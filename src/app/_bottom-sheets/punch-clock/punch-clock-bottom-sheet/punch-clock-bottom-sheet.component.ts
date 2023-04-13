import { EmployeesService } from './../../../_services/employees.service';
import { TimeStampService } from './../../../_services/time-stamp.service';
import { Employee } from './../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { formatDate, formatTime } from '../../../_helpers/date-time-formatter'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { TimeStamp } from 'src/app/_models/time-stamp.model';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';


@Component({
  selector: 'app-punch-clock-bottom-sheet',
  templateUrl: './punch-clock-bottom-sheet.component.html',
  styleUrls: ['./punch-clock-bottom-sheet.component.scss']
})
export class PunchClockBottomSheetComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private _snackBar: MatSnackBar,
    public timeStampService: TimeStampService,
    public employeesService: EmployeesService,
    public formBuilder: UntypedFormBuilder,
    private bottomSheetRef: MatBottomSheetRef<PunchClockBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public employee: Employee
  ) {
    this.currentTime = new Date();
    this.timeStampForm = this.formBuilder.group({
      uid: [employee.uid],
      employeeId: [employee.id],
      employeeName: [employee.name],
      startTime: [''],
      endTime: [''],
      date: [''],
    });
  }

  public timeStampForm: UntypedFormGroup;
  currentTime: Date;
  formattedDate: string;
  formattedTime: string;

  ngOnInit(): void {
    this.formattedDate = formatDate(this.currentTime); // Use the imported function
    this.formattedTime = formatTime(this.currentTime); // Use the imported function
  }

  toggleClockInOut(employee: Employee) {
    if (!employee.clockedIn) {
      this.clockIn(employee);
    } else {
      this.clockOut(employee);
    }
  }

  clockIn(employee: Employee) {
    // Make employee clock in
    employee.clockedIn = !employee.clockedIn;
    this.employeesService.updateEmployee(employee, employee.id)
    this.timeStampForm.patchValue({
      startTime: this.formattedTime,
      date: this.formattedDate
    });
    // Create time stamp
    this.timeStampService.createTimeStamp(this.timeStampForm.value)
    // Alert
    this.showSnackBar("Employee has clocked in!");
    // Close bottom sheet
    this.closeBottomSheet();
  }

  clockOut(employee: Employee) {
    // Make employee clock out
    employee.clockedIn = !employee.clockedIn;
    this.employeesService.updateEmployee(employee, employee.id);

    this.timeStampService.getTimeStampsByDateAndEmployeeId(this.formattedDate, employee.id).subscribe((timeStamps) => {
      if (timeStamps.length > 0) {
        const timeStampData = (timeStamps[0].payload.doc.data() as TimeStamp);
        const timeStampId = timeStamps[0].payload.doc.id;
        timeStampData.endTime = this.formattedTime;
        this.timeStampService.updateTimeStamp(timeStampData, timeStampId);

        const workedTime = this.calculateWorkedTime(timeStampData.startTime, timeStampData.endTime);
        this.showSnackBar(`Employee has clocked out! Worked ${workedTime.hours} hours and ${workedTime.minutes} minutes`);
      }
    });

    // Close bottom sheet
    this.closeBottomSheet();
  }

  closeBottomSheet(): void {
    this.bottomSheetRef.dismiss();
  }

  showSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: ['green-snackbar']
    });
  }

  calculateWorkedTime(startTime: string, endTime: string): { hours: number, minutes: number } {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diff = (end.getTime() - start.getTime()) / 1000;

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);

    return { hours, minutes };
  }
}
