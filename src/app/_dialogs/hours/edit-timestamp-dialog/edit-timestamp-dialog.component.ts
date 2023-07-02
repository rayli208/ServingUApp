import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimeStamp } from 'src/app/_models/time-stamp.model';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-timestamp-dialog',
  templateUrl: './edit-timestamp-dialog.component.html',
  styleUrls: ['./edit-timestamp-dialog.component.scss']
})
export class EditTimestampDialogComponent {
  startTime: string;
  endTime: string;

  constructor(
    public dialogRef: MatDialogRef<EditTimestampDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { timestamp: TimeStamp }
  ) {
    this.startTime = moment(data.timestamp.startTime).local().format('YYYY-MM-DDTHH:mm');
    this.endTime = moment(data.timestamp.endTime).local().format('YYYY-MM-DDTHH:mm');
  }

  formatDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().slice(0, 16);
  }

  save() {
    let startTime = moment(this.startTime, 'YYYY-MM-DDTHH:mm').utc().toDate();
    let endTime = moment(this.endTime, 'YYYY-MM-DDTHH:mm').utc().toDate();

    this.dialogRef.close({ startTime, endTime });
  }
}
