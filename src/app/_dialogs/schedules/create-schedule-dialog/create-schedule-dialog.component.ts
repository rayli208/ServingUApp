import { ScheduleService } from './../../../_services/schedule.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-create-schedule-dialog',
  templateUrl: './create-schedule-dialog.component.html',
  styleUrls: ['./create-schedule-dialog.component.css']
})
export class CreateScheduleDialogComponent implements OnInit {
  public scheduleForm: FormGroup;
  
  constructor(
    public scheduleService: ScheduleService,
    public formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<CreateScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA)data: any
  ) {
    this.scheduleForm = this.formBuilder.group({
      uid: [data.uid],
      employeeName: [data.name],
      startTime: [''],
      endTime: [''],
      date: [''],
      note: [''],
    });
    console.log(data);
  }

  //Set ID of owner of job on load
  ngOnInit() {

  }
  
  //Create job and redirect to dashboard
  onSubmit() {
    console.log(this.scheduleForm);
    // this.scheduleService.createSchedule(this.scheduleForm.value);
    this.dialogRef.close();
  }



}
