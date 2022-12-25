import { EditScheduleDialogComponent } from './../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ScheduleService } from './../_services/schedule.service';
import { Schedule } from './../_models/schedule.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-timesheet-dashboard',
  templateUrl: './timesheet-dashboard.component.html',
  styleUrls: ['./timesheet-dashboard.component.scss']
})
export class TimesheetDashboardComponent implements OnInit {
  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)

  Schedules: Schedule[]; //ALL Schedules
  daysOfWeek: string[] = []; // array to store the days of the week
  base: number = 0; //What week we are on always starts on THIS week
  populatedSchedulesWithDates: any[] = [];

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private scheduleService: ScheduleService,
  ) {
    this.user = null;
  }

  generateSchedule() {
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
          console.log("THE SCHEDULES", this.Schedules)

          this.populateSchedule();
        });
      }
    });
  }

  // function to populate the array
  populateDaysOfWeek(offset: number): void {
    // get the current date and time
    const now = new Date();

    // set the date to the previous Monday
    now.setDate(now.getDate() - now.getDay() + 1);

    // add the specified offset (in weeks) to the date
    now.setDate(now.getDate() + 7 * offset);

    // empty the array
    this.daysOfWeek = [];

    // loop for two weeks
    for (let i = 0; i < 14; i++) {
      // add the current date to the array in the yyyy-mm-dd format
      this.daysOfWeek.push(now.toISOString().slice(0, 10));

      // increment the date by one day
      now.setDate(now.getDate() + 1);
    }
  }

  ngOnInit(): void {
    this.generateSchedule();
  }


  // function to increment the dates by one week
  incrementWeek(): void {
    this.base++;
    this.populateSchedule();
  }

  // function to decrement the dates by one week
  decrementWeek(): void {
    this.base--;
    this.populateSchedule();
  }

  //Populates grand object with all the dates an employee works
  populateSchedule(): void {
    this.populateDaysOfWeek(this.base);
    this.populatedSchedulesWithDates = [];

    for (var i = 0; i < this.daysOfWeek.length; i++) {
      let schedule = [];


      for (let j = 0; j < this.Schedules.length; j++) {
        var d: any = this.Schedules[j].date;

        if (d == this.daysOfWeek[i]) {
          schedule.push(this.Schedules[j])
        }
      }

      this.populatedSchedulesWithDates.push({
        date: this.daysOfWeek[i],
        schedule: schedule
      });
    }

    console.log(this.populatedSchedulesWithDates)
  }


  //Edit Function
  editSchedule(schedule: Schedule, j, i) {
    const dialogRef = this.dialog.open(EditScheduleDialogComponent, {
      data: schedule
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { 
      this.populatedSchedulesWithDates[i].schedules?.splice(j, 1, result);
    });
  }

  //Remove Schedule 
  deleteSchedule(schedule: Schedule, j, i) {
    if (confirm("Are you sure you want to delete " + schedule.employeeName + "'s schedule?")) {
      console.log("Schedule has been deleted");
      this.scheduleService.deleteSchedule(schedule);
      this.populatedSchedulesWithDates[i].schedules?.splice(j, 1);
    }
  }

  //Print Function
  onPrint() {
    // this.accordion.openAll();
    // setTimeout(() => {
    //   window.print();
    // }, 1500);
    window.print();
  }
}
