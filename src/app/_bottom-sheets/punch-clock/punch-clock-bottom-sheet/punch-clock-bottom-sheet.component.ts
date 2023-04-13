import { EmployeesService } from './../../../_services/employees.service';
import { TimeStampService } from './../../../_services/time-stamp.service';
import { Employee } from './../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { formatDate, formatTime } from '../../../_helpers/date-time-formatter'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-punch-clock-bottom-sheet',
  templateUrl: './punch-clock-bottom-sheet.component.html',
  styleUrls: ['./punch-clock-bottom-sheet.component.scss']
})
export class PunchClockBottomSheetComponent implements OnInit {

  constructor(
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

  clockIn(employee: Employee) {
    //Make employee clock in
    employee.clockedIn = !employee.clockedIn;
    this.employeesService.updateEmployee(employee, employee.id)
    this.timeStampForm.patchValue({
      startTime: this.formattedTime,
      date: this.formattedDate
    });
    //Create time stamp
    this.timeStampService.createTimeStamp(this.timeStampForm.value)
    //Close bottom sheet
    this.closeBottomSheet();
  }

  closeBottomSheet(): void {
    this.bottomSheetRef.dismiss();
  }
}
