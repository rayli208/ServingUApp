import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';
import { ScheduleService } from '../_services/schedule.service';

@Component({
  selector: 'app-punch-clock-dashboard',
  templateUrl: './punch-clock-dashboard.component.html',
  styleUrls: ['./punch-clock-dashboard.component.scss']
})
export class PunchClockDashboardComponent implements OnInit {

  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
  Employees: Employee[];
  Schedules: any[];

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
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
          })
        });
      }
    });
  }
}
