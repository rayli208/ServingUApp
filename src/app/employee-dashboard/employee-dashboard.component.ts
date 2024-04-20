import { ScheduleService } from 'src/app/_services/schedule.service';
import { CreateEmployeeDialogComponent } from '../_dialogs/employee/create-employee-dialog/create-employee-dialog.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Employee } from '../_models/employee.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { EmployeesService } from '../_services/employees.service';
import { EditEmployeeDialogComponent } from '../_dialogs/employee/edit-employee-dialog/edit-employee-dialog.component';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CreateScheduleDialogComponent } from '../_dialogs/schedules/create-schedule-dialog/create-schedule-dialog.component';
import { Schedule } from '../_models/schedule.model';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { MassTextDialogComponent } from '../_dialogs/employee/mass-text-dialog/mass-text-dialog.component';
import { MessagesService } from '../_services/messages.service';
import { AuthService } from '../_services/auth.service';
import { TimeoffService } from '../_services/timeoff.service';
import { Timeoff } from '../_models/timeoff.model';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  userId;
  user: Observable<any>;
  Employees: Employee[];
  Schedules: any[];
  employeeNameFilter: string = '';
  positionFilter: string = '';
  floorEmployeeFilter: string = 'all';

  constructor(
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private employeesService: EmployeesService,
    private storage: AngularFireStorage,
    public scheduleService: ScheduleService,
    private timeoffService: TimeoffService,
    public messagesService: MessagesService,
  ) {
    this.user = null;
  }



  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
          this.Employees = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Employee;
          }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        });
      }
    });
  }

  createEmployee(): void {
    const dialogRef = this.dialog.open(CreateEmployeeDialogComponent, {});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.employeeCreated) {
        this._snackBar.open('Employee has been created!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      }
    });
  }

  removeEmployee(employee: Employee) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete ${employee.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //Get all schedules for that employee
        this.scheduleService.getSchedulesListForEmployee(employee.id).subscribe(res => {
          this.Schedules = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Schedule;
          });
          //Delete all schedules associated to employee
          this.Schedules.forEach(x => this.scheduleService.deleteSchedule(x));
        });
        // Fetch all time-offs for the employee
        this.timeoffService.getTimeoffListForEmployee(employee.id).subscribe(res => {
          const timeoffs = res.map(e => ({ id: e.payload.doc.id, ...e.payload.doc.data() as {} })) as Timeoff[];
          // Delete all time-offs associated with the employee
          timeoffs.forEach(timeoff => this.timeoffService.deleteTimeoff(timeoff));
        });

        //Delete all images associated to employee
        this.storage.storage.refFromURL(employee.imgUrl).delete();
        //Delete employee
        this.employeesService.deleteEmployee(employee);
        //Alert
        this._snackBar.open('Employee has been deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      }
    });
  }

  editEmployee(employee: Employee) {
    const dialogRef = this.dialog.open(EditEmployeeDialogComponent, {
      data: employee
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.employeeEdited) {
        this._snackBar.open('Employee has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      }
    });
  }

  createSchedule(name: string, uid: string, employeeId: string) {
    const dialogRef = this.dialog.open(CreateScheduleDialogComponent, {
      data: {
        name: name,
        uid: uid,
        employeeId: employeeId,
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

  copyText(val: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  resetFilter() {
    this.employeeNameFilter = '';
    this.positionFilter = '';
    this.floorEmployeeFilter = 'all';
  }


  sendOutText(): void {
    const dialogRef = this.dialog.open(MassTextDialogComponent, {
      data: { employees: this.filteredEmployees }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.selectedEmployees.length > 0) {
        this.sendMassTexts(result.selectedEmployees, result.message);
      }
    });
  }

  sendMassTexts(selectedEmployees, messageContent) {
    const messages = selectedEmployees.map(employee => ({
      channelId: 'a31f78766da04f9e95ce52a85cf13bdd', // Use your actual channelId
      to: '1' + employee.phone.replace(/-/g, ""),
      type: 'text',
      content: { text: messageContent }
    }));
  
    console.log(`Total messages to send: ${messages.length}`);
  
    let totalMessagesCount = 0;
    let messagesProcessed = 0; // Counter for processed messages
  
    messages.forEach((message, index) => {
      this.messagesService.createMessage(message).then(() => {
        totalMessagesCount += Math.ceil(message.content.text.length / 153);
        messagesProcessed++; // Increment counter after each message is processed
        console.log(`Message ${index + 1} sent successfully. Messages processed: ${messagesProcessed}`);
  
        if (messagesProcessed === messages.length) { // Check if all messages have been processed
          console.log('All messages processed, updating texts count and showing snackbar.');
          // Update texts count and show snackbar
          this.authService.updateTextsThisMonth(totalMessagesCount).then(() => {
            console.log('Texts count updated, showing success snackbar.');
            this.showSnackBar("All texts have been sent!", "green-snackbar");
          }).catch(error => {
            console.error('Error updating texts count:', error);
            this.showSnackBar("Error updating texts count!", "red-snackbar");
          });
        }
      }).catch(error => {
        console.error(`Error sending message ${index + 1}:`, error);
        messagesProcessed++; // Increment counter even if a message fails to send
        if (messagesProcessed === messages.length) { // Check if all messages have been processed
          console.log('All messages processed with some errors, showing error snackbar.');
          // Show snackbar indicating some texts might not have been sent
          this.showSnackBar("Some texts might not have been sent!", "red-snackbar");
        }
      });
    });
  }  

  showSnackBar(message: string, panelClass: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: [panelClass]
    });
  }


  get filteredEmployees() {
    return this.Employees?.filter(employee =>
      (!this.employeeNameFilter || employee.name.toLowerCase().includes(this.employeeNameFilter.toLowerCase())) &&
      (!this.positionFilter || employee.position.toLowerCase().includes(this.positionFilter.toLowerCase())) &&
      (this.floorEmployeeFilter === 'all' || (this.floorEmployeeFilter === 'true' && employee.floorEmployee) || (this.floorEmployeeFilter === 'false' && !employee.floorEmployee))
    ) || [];
  }

}