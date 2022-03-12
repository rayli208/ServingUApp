import { EditScheduleDialogComponent } from './../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ScheduleService } from './../_services/schedule.service';
import { Schedule } from './../_models/schedule.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';

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
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private scheduleService: ScheduleService,
  ) {
    this.user = null;
  }
  ngOnInit(): void {
    this.generateSchedule();
  }


  generateSchedule(){
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

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

  //Edit Function
  editSchedule(schedule: Schedule, j, i) {
    const dialogRef = this.dialog.open(EditScheduleDialogComponent, {
      data: schedule
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { 
      this.dailySchedules[i].schedules.splice(j, 1, result);
    });
  }

  //Remove Schedule 
  deleteSchedule(schedule: Schedule, j, i) {
    if (confirm("Are you sure you want to delete " + schedule.employeeName + "'s schedule?")) {
      this.scheduleService.deleteSchedule(schedule);
      this.dailySchedules[i].schedules.splice(j, 1);
    }
  }

  //Print Function
  onPrint() {
    this.accordion.openAll();
    setTimeout(() => {
      window.print();
    }, 1500);
  }
}
