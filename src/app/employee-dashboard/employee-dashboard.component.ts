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

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
  Employees: Employee[];
  Schedules: any[];

  constructor(
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
    private storage: AngularFireStorage,
    public scheduleService: ScheduleService
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

  createSchedule(name: string, uid: string, employeeId: string, employeePhone: string) {
    const dialogRef = this.dialog.open(CreateScheduleDialogComponent, {
      data: {
        name: name,
        uid: uid,
        employeeId: employeeId,
        employeePhone: employeePhone
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
}