import { CreateEmployeeDialogComponent } from '../_dialogs/employee/create-employee-dialog/create-employee-dialog.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Employee } from '../_models/employee.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { EmployeesService } from '../_services/employees.service';
import { EditEmployeeDialogComponent } from '../_dialogs/employee/edit-employee-dialog/edit-employee-dialog.component';
import { AngularFireStorage } from '@angular/fire/storage';
import { CreateScheduleDialogComponent } from '../_dialogs/schedules/create-schedule-dialog/create-schedule-dialog.component';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
  Employees: Employee[];

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
    private storage: AngularFireStorage,
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
          })
        });
      }
    });


  }

  createEmployee(): void {
    const dialogRef = this.dialog.open(CreateEmployeeDialogComponent, {});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }


  removeEmployee(employee: Employee) {
    console.log(employee.imgUrl);
    if (confirm("Are you sure you want to delete " + employee.name)) {
      this.storage.storage.refFromURL(employee.imgUrl).delete();
      this.employeesService.deleteEmployee(employee);
    }
  }

  editEmployee(employee: Employee) {
    const dialogRef = this.dialog.open(EditEmployeeDialogComponent, {
      data: employee
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }

  createSchedule(name: string, userId: string, employeeId: string){
    const dialogRef = this.dialog.open(CreateScheduleDialogComponent, {data: {
      name: name,
      userId: userId,
      employeeId: employeeId
    }});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }
}