import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { TimeStamp } from 'src/app/_models/time-stamp.model';
import { TimeStampService } from 'src/app/_services/time-stamp.service';

@Component({
  selector: 'app-hours-dashboard',
  templateUrl: './hours-dashboard.component.html',
  styleUrls: ['./hours-dashboard.component.scss']
})
export class HoursDashboardComponent implements OnInit {

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  timestamps = [];
  totalHours: { [key: string]: number } = {};

  userId: string;

  constructor(private timeStampService: TimeStampService, private afAuth: AngularFireAuth) {
  }

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        // We don't load the time stamps here
      }
    });
  }

  loadTimestamps() {
  if (this.range.valid) {
    let startDate = this.range.controls.start.value;
    let endDate = this.range.controls.end.value;

    // Check if the startDate is not null
    if (!startDate) {
      alert('Start date is not selected.');
      return;
    }

    // Check if the endDate is not null and covers the whole day
    if (endDate) {
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59);
    } else {
      alert('End date is not selected.');
      return;
    }

    this.timeStampService.getTimeStampsForUserAndDateRange(this.userId, startDate, endDate)
      .subscribe((res) => {
          this.timestamps = res.map((e) => {
              const data = e.payload.doc.data() as any; // Cast to any to avoid TypeScript errors
              const hoursWorked = (data.endTime.toDate() - data.startTime.toDate()) / (1000 * 60 * 60); // Convert milliseconds to hours
              return {
                id: e.payload.doc.id,
                uid: data.uid,
                employeeId: data.employeeId,
                employeeName: data.employeeName,
                startTime: data.startTime.toDate(),
                endTime: data.endTime.toDate(),
                hoursWorked: hoursWorked.toFixed(2)
              } as TimeStamp;
          });

          this.calculateTotalHours();
      });
  }
  else {
    alert('Please select a valid date range.');
  }
}


  calculateTotalHours() {
    this.totalHours = {};

    this.timestamps.forEach(timestamp => {
      if (!this.totalHours[timestamp.employeeName]) {
        this.totalHours[timestamp.employeeName] = 0;
      }
      this.totalHours[timestamp.employeeName] += parseFloat(timestamp.hoursWorked);
    });

    for (let employee in this.totalHours) {
      this.totalHours[employee] = parseFloat(this.totalHours[employee].toFixed(2));
    }
  }

  // This function converts a Firebase timestamp to a JavaScript Date object
  convertDate(firebaseTimestamp: any): Date {
    const timestamp = firebaseTimestamp.split(' ');
    const date = timestamp[0];
    const time = timestamp[1].split(' ')[0];
    const period = timestamp[1].split(' ')[1];
    const timezone = timestamp[2];

    const [month, day, year] = date.split(',');
    const [hour, minute, second] = time.split(':');

    const dateObject = new Date(`${month} ${day}, ${year} ${hour}:${minute}:${second} ${period} ${timezone}`);
    return dateObject;
  }
}
