import { EditScheduleDialogComponent } from '../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { ScheduleService } from '../_services/schedule.service';
import { Schedule } from '../_models/schedule.model';
import { Component, HostListener, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { CreateScheduleFromDateDialogComponent } from '../_dialogs/schedules/create-schedule-from-date-dialog/create-schedule-from-date-dialog.component';
import { MessagesService } from '../_services/messages.service';
import { Message } from '../_models/message.model';
import { AuthService } from '../_services/auth.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';
import { TimeoffService } from '../_services/timeoff.service';
import { Timeoff } from '../_models/timeoff.model';

@Component({
  selector: 'app-schedule-dashboard',
  templateUrl: './schedule-dashboard.component.html',
  styleUrls: ['./schedule-dashboard.component.scss']
})
export class ScheduleDashboardComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  userId;
  user: Observable<any>;
  isHorizontalModeDisabled: boolean = false;
  Employees: Employee[];
  employeeMap: { [id: string]: Employee } = {};

  selectedView: string = 'Horizontal';
  views: string[] = ['Vertical', 'Horizontal'];

  Schedules: Schedule[];
  timeOffs: Timeoff[] = [];
  daysOfWeek: string[] = [];
  base: number = 0;
  populatedSchedulesWithDates: any[] = [];

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private scheduleService: ScheduleService,
    public messagesService: MessagesService,
    public authService: AuthService,
    public _snackBar: MatSnackBar,
    private employeesService: EmployeesService,
    private timeoffService: TimeoffService,
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.generateSchedule();
    this.handleWindowResize(window.innerWidth);
    this.fetchTimeOffs();
  }

  @HostListener('window:resize', ['$event.target.innerWidth'])
  onResize(innerWidth: number) {
    this.handleWindowResize(innerWidth);
  }

  fetchTimeOffs() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.timeoffService.getTimeoffListForUser(user.uid).subscribe(res => {
          this.timeOffs = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Timeoff;
          });
        });
      }
    });
  }


  generateSchedule() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
          this.Employees = res.map(e => {
            const employee = {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Employee;

            // Update the mapping
            this.employeeMap[employee.id] = employee;

            return employee;
          }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        });

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

  handleWindowResize(innerWidth: number) {
    if (innerWidth <= 992) {
      this.selectedView = 'Vertical';
      this.isHorizontalModeDisabled = true;
    } else {
      this.isHorizontalModeDisabled = false;
    }
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

  getEmployeeName(employeeId: string): string {
    const employee = this.Employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown';
  }

  //Populates grand object with all the dates an employee works
  populateSchedule(): void {
    this.populateDaysOfWeek(this.base);
    this.populatedSchedulesWithDates = [];

    for (var i = 0; i < this.daysOfWeek.length; i++) {
      let schedule = [];

      for (let j = 0; j < this.Schedules.length; j++) {
        if (this.Schedules[j]?.date) {
          const [year, month, day] = this.Schedules[j].date.split("-").map(Number);
          const d: any = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);

          if (d == this.daysOfWeek[i]) {
            schedule.push(this.Schedules[j]);
          }
        }
      }

      // Sort the schedule array based on startTime in ascending order
      schedule.sort((a, b) => {
        return a.startTime < b.startTime ? -1 : (a.startTime > b.startTime ? 1 : 0);
      });

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

      if (result) {
        this._snackBar.open('Schedule has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      }
    });
  }

  //Remove Schedule 
  deleteSchedule(schedule: Schedule, j, i) {
    const employeeName = this.employeeMap[schedule.employeeId]?.name || 'Unknown Employee';
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete ${employeeName}'s schedule?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.scheduleService.deleteSchedule(schedule);
        this.populatedSchedulesWithDates[i].schedules?.splice(j, 1);
        this._snackBar.open('Schedule has been deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      }
    });
  }

  //Print Function
  onPrint() {
    window.print();
  }

  // This function takes a string in the format "YYYY-MM-DD" and returns a string in the format "Day of the week MM/DD/YY"
  public formatDate(date: string): string {
    if (!date) {
      return 'Unknown Date';
    }

    const [year, month, day] = date.split("-").map(Number);
    const dateObject = new Date(Date.UTC(year, month - 1, day));

    // Get the day of the week as a string (e.g. "Sunday")
    const dayOfWeek = this.getDayOfWeek(dateObject.getUTCDay());

    // Get the month as a string (e.g. "01")
    const monthStr = this.getMonth(dateObject.getUTCMonth());

    // Get the day as a string (e.g. "15")
    const dayStr = this.getDay(dateObject.getUTCDate());

    // Return the formatted string
    return `${dayOfWeek} - ${monthStr}/${dayStr}`;
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

  public createSchedule(date: string) {
    const scheduledEmployees = this.populatedSchedulesWithDates.find(d => d.date === date)?.schedule.map(s => s.employeeId) || [];

    const dialogRef = this.dialog.open(CreateScheduleFromDateDialogComponent, {
      data: {
        date: date,
        timeOffs: this.timeOffs,
        scheduledEmployees: scheduledEmployees
      }
    });

    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.scheduleCreated) {
        this._snackBar.open('Schedule has been created!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      }
    });
  }

  getEmployeeCount(day: any): number {
    return day.schedule?.length || 0;
  }

  sendOutText() {
    let schedulesByEmployee = {};

    for (let day of this.populatedSchedulesWithDates) {
      for (let schedule of day.schedule) {
        let employeeId = schedule.employeeId;
        let employee = this.employeeMap[employeeId];

        if (employee) {
          let employeePhone = employee.phone;
          let employeeName = employee.name;

          if (!schedulesByEmployee[employeePhone]) {
            schedulesByEmployee[employeePhone] = {
              name: employeeName,
              schedules: []
            };
          }

          schedulesByEmployee[employeePhone].schedules.push(schedule);
        }
      }
    }

    let messages = [];
    let startDate = this.formatDate(this.populatedSchedulesWithDates[0]?.date);
    let endDate = this.formatDate(this.populatedSchedulesWithDates[13]?.date);

    for (let phoneNumber in schedulesByEmployee) {
      let messageText = `${startDate} to  ${endDate}\n${schedulesByEmployee[phoneNumber].name} schedule:\n`;
      for (let schedule of schedulesByEmployee[phoneNumber].schedules) {
        let dateParts = schedule.date.split('-');
        let formattedDate = `${dateParts[1]}/${dateParts[2]}`;
        let formattedStartTime = this.convertTo12HourFormat(schedule.startTime);
        let formattedEndTime = this.convertTo12HourFormat(schedule.endTime);
        messageText += `${formattedDate}: ${formattedStartTime}-${formattedEndTime}\n`;
      }

      const message: Message = {
        channelId: 'a31f78766da04f9e95ce52a85cf13bdd',
        to: '1' + phoneNumber.replace(/-/g, ""),
        type: 'text',
        content: {
          text: messageText
        }
      };

      messages.push(message);
    }

    let totalMessagesCount = messages.reduce((count, message) => count + Math.ceil(message.content.text.length / 153), 0);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to send ${totalMessagesCount} messages?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        for (let message of messages) {
          this.messagesService.createMessage(message);
        }

        this.authService.updateTextsThisMonth(totalMessagesCount)
          .then(() => {
            this._snackBar.open('Text has been sent!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['green-snackbar']
            });
          })
          .catch(error => {
            // Handle the error if needed
          });
      }
    });
  }

  // This function converts a time in 24-hour format to 12-hour format
  convertTo12HourFormat(time: string): string {
    let [hours, minutes] = time.split(':').map(Number);
    let period = hours < 12 ? 'AM' : 'PM';
    if (hours == 0) {
      hours = 12;
    } else if (hours > 12) {
      hours -= 12;
    }
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}${period}`;
  }

  // This method returns true if there are no schedules during the selected weeks, and false otherwise
  public noSchedules(): boolean {
    // Loop through all the dates
    for (let day of this.populatedSchedulesWithDates) {
      // If there are any schedules for the current date, return false
      if (day.schedule.length > 0) {
        return false;
      }
    }

    // If we've looped through all the dates and haven't found any schedules, return true
    return true;
  }
}
