import { ScheduleService } from './../../../_services/schedule.service';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-create-schedule-dialog',
  templateUrl: './create-schedule-dialog.component.html',
  styleUrls: ['./create-schedule-dialog.component.css']
})
export class CreateScheduleDialogComponent implements OnInit {
  constructor(
    public scheduleService: ScheduleService,
    public formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<CreateScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.scheduleForm = this.formBuilder.group({
      userId: [data.userId],
      employeeId: [data.employeeId],
      employeeName: [data.name],
      startTime: [''],
      endTime: [''],
      date: [''],
      note: [''],
    });
  }

  public scheduleForm: FormGroup;

  //Date Picker Functionality
  public CLOSE_ON_SELECTED = false;
  public init = new Date();
  public resetModel = new Date(0);
  public model = [];
  @ViewChild('picker', { static: true }) _picker: MatDatepicker<Date>;

  public dateClass = (date: Date) => {
    if (this._findDate(date) !== -1) {
      return ['selected'];
    }
    return [];
  }

  public dateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      const date = event.value;
      const index = this._findDate(date);
      if (index === -1) {
        this.model.push(date);
      } else {
        this.model.splice(index, 1)
      }
      this.resetModel = new Date(0);
      if (!this.CLOSE_ON_SELECTED) {
        const closeFn = this._picker.close;
        this._picker.close = () => { };
        this._picker['_popupComponentRef'].instance._calendar.monthView._createWeekCells()
        setTimeout(() => {
          this._picker.close = closeFn;
        });
      }
    }
  }

  public remove(date: Date): void {
    const index = this._findDate(date);
    this.model.splice(index, 1)
  }

  private _findDate(date: Date): number {
    return this.model.map((m) => +m).indexOf(+date);
  }

  //Set ID of owner of job on load
  ngOnInit() {

  }

  //Create job and redirect to dashboard
  onSubmit() {
    this.loopThroughDates(this.model);
    this.dialogRef.close();
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
