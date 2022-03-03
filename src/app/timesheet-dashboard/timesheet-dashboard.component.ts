import { ScheduleService } from './../_services/schedule.service';
import { Schedule } from './../_models/schedule.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-timesheet-dashboard',
  templateUrl: './timesheet-dashboard.component.html',
  styleUrls: ['./timesheet-dashboard.component.css']
})
export class TimesheetDashboardComponent implements OnInit {
  dailySchedules: any[] = [];
  @ViewChild(MatAccordion) accordion: MatAccordion;
  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
  Schedules: Schedule[];

  constructor(
    private afAuth: AngularFireAuth,
    private scheduleService: ScheduleService,
  ) {
    this.user = null;
  }
  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        console.log(this.userId);

        this.scheduleService.getSchedulesListForUser(this.userId).subscribe(res => {
          this.Schedules = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Schedule;
          });

          this.getDaysOfWeek();
        });
      }
    });
  }







  //Figure out what the current two weeks look like
  getDaysOfWeek() {
    var curr = new Date(); // get current date
    var first = curr.getDate() - curr.getDay() + 1;
    var firstDay = new Date(curr.setDate(first));

    for (var i = 0; i < 13; i++) {
      var schedules: Schedule[] = [];

      var workDay: Date = this.setStartOfDay(this.addDays(firstDay, i));
      var dayStartTime = workDay.getTime()/1000;

      for(let j = 0; j < this.Schedules.length; j++)
      {
        var d: any = this.Schedules[j].date;

        if(d.seconds == dayStartTime){
          schedules.push(this.Schedules[j])
        }
      }

      var dailySchedule = {
        date: workDay,
        schedules: schedules
      }
      this.dailySchedules.push(dailySchedule);
    }
  }

  //Offsets a day by specific number of days
  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  //Gets date with no hours, no seconds, no milliseconds
  setStartOfDay(d: Date) : Date{
    var result = new Date(d);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  onPrint() {
    this.accordion.openAll();
    setTimeout(() => {
      window.print();
    }, 1500);
  }
}
