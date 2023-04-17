import { EditScheduleDialogComponent } from '../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ScheduleService } from '../_services/schedule.service';
import { Schedule } from '../_models/schedule.model';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { CreateScheduleFromDateDialogComponent } from '../_dialogs/schedules/create-schedule-from-date-dialog/create-schedule-from-date-dialog.component';

@Component({
  selector: 'app-schedule-dashboard',
  templateUrl: './schedule-dashboard.component.html',
  styleUrls: ['./schedule-dashboard.component.scss']
})
export class ScheduleDashboardComponent implements OnInit {
  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)


  selectedView: string = 'Horizontal';
  views: string[] = ['Vertical', 'Horizontal'];

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

          //Once we have all the schedules loaded, populate them into the actual object we display
          this.populateSchedule();
        });
      }
    });
  }

  // function to populate the days of the week array
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

  //Initialize the component
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
        var d: any = this.Schedules[j]?.date;

        if (d == this.daysOfWeek[i]) {
          schedule.push(this.Schedules[j])
        }
      }

      this.populatedSchedulesWithDates.push({
        date: this.daysOfWeek[i],
        schedule: schedule
      });
    }
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
      this.scheduleService.deleteSchedule(schedule);
      this.populatedSchedulesWithDates[i].schedules?.splice(j, 1);
    }
  }

  //Print Function
  onPrint() {
    window.print();
  }

  // This function takes a string in the format "YYYY-MM-DD" and returns a string in the format "Day of the week MM/DD/YY"
  public formatDate(date: string): string {
    // Create a new date object from the input string
    const dateObject = new Date(date);

    // Get the day of the week as a string (e.g. "Sunday")
    const dayOfWeek = this.getDayOfWeek(dateObject.getDay());

    // Get the month as a string (e.g. "01")
    const month = this.getMonth(dateObject.getMonth());

    // Get the day as a string (e.g. "15")
    const day = this.getDay(dateObject.getDate());

    // Get the year as a string (e.g. "23")
    // const year = this.getYear(dateObject.getFullYear());

    // Return the formatted string
    return `${dayOfWeek} - ${month}/${day}`;
  }

  // This function takes a number (0-6) and returns the corresponding day of the week as a string
  private getDayOfWeek(dayOfWeek: number): string {
    switch (dayOfWeek) {
      case 0:
        return 'Sun';
      case 1:
        return 'Mon';
      case 2:
        return 'Tues';
      case 3:
        return 'Wed';
      case 4:
        return 'Thurs';
      case 5:
        return 'Fri';
      case 6:
        return 'Sat';
      default:
        throw new Error('Invalid day of week');
    }
  }

  // This function takes a number (0-11) and returns the corresponding month as a string
  private getMonth(month: number): string {
    month += 1; // The month parameter is zero-based (0 = January, 1 = February, etc.), so we need to add 1 to get the correct month number
    return month < 10 ? `0${month}` : `${month}`; // If the month is less than 10, we need to add a leading zero (e.g. "01" for January)
  }

  // This function takes a number (1-31) and returns the corresponding day as a string
  private getDay(day: number): string {
    return day < 10 ? `0${day}` : `${day}`; // If the day is less than 10, we need to add a leading zero (e.g. "01" for the first day of the month)
  }

  // This function takes a number (e.g. 2023) and returns the last two digits as a string (e.g. "23")
  private getYear(year: number): string {
    const yearString = year.toString();
    return yearString.slice(-2); // Return the last two characters of the year string
  }

  private createSchedule(date: string) {
    const dialogRef = this.dialog.open(CreateScheduleFromDateDialogComponent, {
      data: {
        date: date,
      }
    });

    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }

}
