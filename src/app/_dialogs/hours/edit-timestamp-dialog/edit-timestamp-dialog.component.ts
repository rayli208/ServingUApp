import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimeStamp } from 'src/app/_models/time-stamp.model';
import { DateTime, Settings } from 'luxon';

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
    // Set the Luxon settings to work in local time by default
    Settings.defaultLocale = 'utc';
    this.startTime = DateTime.fromJSDate(data.timestamp.startTime).toISO();
    this.endTime = DateTime.fromJSDate(data.timestamp.endTime).toISO();
  }

  formatDate(date: Date): string {
    const offset = date.getTimezoneOffset();
    date = new Date(date.getTime() - offset * 60 * 1000);
    return date.toISOString().slice(0, 16);
  }

  save() {
    let startTime = DateTime.fromISO(this.startTime).toJSDate();
    let endTime = DateTime.fromISO(this.endTime).toJSDate();

    this.dialogRef.close({ startTime, endTime });
  }
}
