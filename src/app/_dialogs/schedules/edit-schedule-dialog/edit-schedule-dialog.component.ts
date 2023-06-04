import { Schedule } from './../../../_models/schedule.model';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ScheduleService } from 'src/app/_services/schedule.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-edit-schedule-dialog',
  templateUrl: './edit-schedule-dialog.component.html',
  styleUrls: ['./edit-schedule-dialog.component.scss']
})
export class EditScheduleDialogComponent implements OnInit {
  public schedule: Schedule;
  public editForm: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Schedule,
    public formBuilder: UntypedFormBuilder,
    public scheduleService: ScheduleService,
    public dialogRef: MatDialogRef<EditScheduleDialogComponent>,
  ) {
    this.schedule = data;

    this.editForm = this.formBuilder.group({ ...this.schedule })
  }

  ngOnInit(): void { }

  onSubmit() {
    this.scheduleService.updateSchedule(this.editForm.value, this.schedule.id);
    this.dialogRef.close(this.editForm.value);
  }
}
