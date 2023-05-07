import { EmployeesService } from './../../../_services/employees.service';
import { TimeStampService } from './../../../_services/time-stamp.service';
import { Employee } from './../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
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
    public formBuilder: FormBuilder,
    private bottomSheetRef: MatBottomSheetRef<PunchClockBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public employee: Employee
  ) {
    this.timeStampForm = this.formBuilder.group({
      uid: [employee.uid],
      employeeId: [employee.id],
      employeeName: [employee.name],
      startTime: [''],
      endTime: [''],
      date: [''],
    });
  }

  public timeStampForm: FormGroup;

  ngOnInit(): void {}

  async handleClockInOrOut(): Promise<void> {
    if (!this.employee.clockedIn) {
      // Clock-in case
      this.employee.clockedIn = true;
      this.employee.clockedInTime = new Date();
      await this.employeesService.updateEmployee(this.employee, this.employee.id);
      this.showSnackBar('You have clocked in!');
      this.closeBottomSheet();
    } else {
      // Clock-out case
      const endTime = new Date();
      const startTime = new Date(this.employee.clockedInTime);
      const hoursWorked = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
      const minutesWorked = Math.floor(((endTime.getTime() - startTime.getTime()) / (1000 * 60)) % 60);
      const message = `You have clocked out! You worked ${hoursWorked} hours and ${minutesWorked} minutes.`;
      await this.timeStampService.createTimeStampWithEmployee(this.employee, endTime);
      this.employee.clockedIn = false;
      this.employee.clockedInTime = null;
      await this.employeesService.updateEmployee(this.employee, this.employee.id);
      this.showSnackBar(message);
      this.closeBottomSheet();
    }
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
}
