import { Component, OnInit } from '@angular/core';
import { Employee } from 'src/app/_models/employee.model';
import { EmployeesService } from 'src/app/_services/employees.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { TimeStampService } from 'src/app/_services/time-stamp.service';

@Component({
  selector: 'app-create-timestamp-dialog',
  templateUrl: './create-timestamp-dialog.component.html',
  styleUrls: ['./create-timestamp-dialog.component.scss']
})
export class CreateTimestampDialogComponent implements OnInit {
  public selectedEmployee: Employee;
  public userId: string;
  public Employees: Employee[];
  public startTime: string;
  public endTime: string;
  public isSaveDisabled: boolean = true;

  constructor(
    private timeStampService: TimeStampService,
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
    public dialogRef: MatDialogRef<CreateTimestampDialogComponent>
  ) { }

  ngOnInit() {
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

  onEmployeeChange(event: any) {
    this.selectedEmployee = event.value;
    this.checkSaveAvailability();
  }

  onStartTimeChange() {
    this.checkSaveAvailability();
  }

  onEndTimeChange() {
    this.checkSaveAvailability();
  }

  checkSaveAvailability() {
    this.isSaveDisabled = !this.selectedEmployee || !this.startTime || !this.endTime;
  }

  onSubmit() {
    const startTime = new Date(this.startTime);
    const endTime = new Date(this.endTime);
  
    const timeStamp = {
      uid: this.selectedEmployee.uid,
      employeeId: this.selectedEmployee.id,
      employeeName: this.selectedEmployee.name,
      startTime,
      endTime
    };
  
    this.timeStampService.createTimeStamp(timeStamp).then(() => {
      this.dialogRef.close();
    });
  }  
}
