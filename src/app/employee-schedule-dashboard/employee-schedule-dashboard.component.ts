import { ScheduleService } from './../_services/schedule.service';
import { EmployeesService } from './../_services/employees.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Schedule } from '../_models/schedule.model';
import { EditScheduleDialogComponent } from '../_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-schedule-dashboard',
  templateUrl: './employee-schedule-dashboard.component.html',
  styleUrls: ['./employee-schedule-dashboard.component.scss']
})
export class EmployeeScheduleDashboardComponent implements OnInit {
  employeeRef: any;
  Schedules: any[];

  constructor(
    public act: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    public employeesService: EmployeesService,
    public scheduleService: ScheduleService
  ) { }


  ngOnInit(): void {
    const id = this.act.snapshot.paramMap.get('id');

    this.employeesService.getEmployeeDoc(id).subscribe(res => {
      this.employeeRef = res;
    });


    this.scheduleService.getSchedulesListForEmployee(id).subscribe(res => {
      this.Schedules = res.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as {}
        } as Schedule;
      })
      //Sort Schedules in chronological order
      this.Schedules.sort(function (x, y) {
        return x.date - y.date;
      })
    });
  }

  //Edit Function
  editSchedule(schedule: Schedule) {
    const dialogRef = this.dialog.open(EditScheduleDialogComponent, {
      data: schedule
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }

  //Remove Schedule 
  deleteSchedule(schedule: Schedule) {
    if (confirm("Are you sure you want to delete " + schedule.employeeName + "'s schedule?")) {
      this.scheduleService.deleteSchedule(schedule);
    }
  }

  backToSchedule() {
    this.router.navigate(['employee-dashboard']);
  }
}