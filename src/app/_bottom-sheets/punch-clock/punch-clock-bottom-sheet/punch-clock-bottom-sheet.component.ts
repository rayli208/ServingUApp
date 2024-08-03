import { EmployeesService } from './../../../_services/employees.service';
import { TimeStampService } from './../../../_services/time-stamp.service';
import { Employee } from './../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FormBuilder, FormGroup } from '@angular/forms';

import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { TablesService } from 'src/app/_services/tables.service';
import { Table } from 'src/app/_models/table.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-punch-clock-bottom-sheet',
  templateUrl: './punch-clock-bottom-sheet.component.html',
  styleUrls: ['./punch-clock-bottom-sheet.component.scss']
})
export class PunchClockBottomSheetComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private _snackBar: MatSnackBar,
    public timeStampService: TimeStampService,
    public employeesService: EmployeesService,
    private tablesService: TablesService,
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

  ngOnInit(): void { }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions when the component is destroyed
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  async handleClockInOrOut(): Promise<void> {
    try {
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
        const startTime = new Date((this.employee.clockedInTime as any).toDate());
        const hoursWorked = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60));
        const minutesWorked = Math.floor(((endTime.getTime() - startTime.getTime()) / (1000 * 60)) % 60);
        const message = `You have clocked out! You worked ${hoursWorked} hour${hoursWorked == 1 ? '' : 's'} and ${minutesWorked} minute${minutesWorked == 1 ? '' : 's'}.`;
        
        // Update timestamp
        await this.timeStampService.createTimeStampWithEmployee(this.employee, endTime);
        
        // Update tables
        await this.tablesService.updateTablesOnEmployeeClockOut(this.employee.uid, this.employee.id);
        
        // Update employee
        this.employee.clockedIn = false;
        this.employee.clockedInTime = null;
        await this.employeesService.updateEmployee(this.employee, this.employee.id);
        
        this.showSnackBar(message);
        this.closeBottomSheet();
      }
    } catch (error) {
      console.error('Error in handleClockInOrOut:', error);
      this.showSnackBar('An error occurred. Please try again.');
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
