import { ScheduleService } from './../../../_services/schedule.service';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-schedule-dialog',
  templateUrl: './create-schedule-dialog.component.html',
  styleUrls: ['./create-schedule-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateScheduleDialogComponent implements OnInit {
  constructor(
    public scheduleService: ScheduleService,
    public formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CreateScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.employeeName = data.name; // <--- Here
    this.scheduleForm = this.formBuilder.group({
      uid: [data.uid],
      employeeId: [data.employeeId],
      startTime: ['09:00'],
      endTime: ['17:00'],
      date: [''],
      note: [''],
    });
  }
  public employeeName: string;
  public scheduleForm: UntypedFormGroup;
  daysSelected: any[] = [];
  event: any;
  
  isSelected = (event: any) => {
    const date =
      event.getFullYear() +
      "-" +
      ("00" + (event.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + event.getDate()).slice(-2);
    return this.daysSelected.find(x => x == date) ? "selected" : null;
  };

  select(event: any, calendar: any) {
    const date =
      event.getFullYear() +
      "-" +
      ("00" + (event.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + event.getDate()).slice(-2);
    const index = this.daysSelected.findIndex(x => x == date);
    if (index < 0) this.daysSelected.push(date);
    else this.daysSelected.splice(index, 1);

    calendar.updateTodaysDate();
  }

  deleteDate(date: any) {
    for (let i = 0; i < this.daysSelected.length; i++) {
      if (this.daysSelected[i] === date) {
        this.daysSelected.splice(i, 1);
      }
    }
  }

  //Set ID of owner of job on load
  ngOnInit() {

  }

  //Create job and redirect to dashboard
  onSubmit() {
    this.loopThroughDates(this.daysSelected);
    this.dialogRef.close({scheduleCreated: true});
  }

  loopThroughDates(dates) {
    for (let i = 0; i < dates.length; i++) {
      this.scheduleForm.patchValue({
        date: dates[i],
      });

      this.scheduleService.createSchedule(this.scheduleForm.value);
    }
  }

}
