import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ScheduleService } from './../../../_services/schedule.service';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Employee } from 'src/app/_models/employee.model';
import { EmployeesService } from 'src/app/_services/employees.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-schedule-from-date-dialog',
  templateUrl: './create-schedule-from-date-dialog.component.html',
  styleUrls: ['./create-schedule-from-date-dialog.component.scss']
})
export class CreateScheduleFromDateDialogComponent implements OnInit {
  public scheduleForm: UntypedFormGroup;
  public selectedEmployee: Employee;
  public userId: string;
  public user: Observable<any>;
  public Employees: Employee[] = [];
  public scheduledEmployees: string[];

  constructor(
    public scheduleService: ScheduleService,
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
    public formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CreateScheduleFromDateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.user = null;
    this.scheduleForm = this.formBuilder.group({
      uid: [''],
      employeeId: [''],
      startTime: ['09:00'],
      endTime: ['17:00'],
      date: [data.date],
      note: [''],
    });
    this.scheduledEmployees = data.scheduledEmployees || [];
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
          this.Employees = res.map(e => {
            const employee = {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Employee;
        
            // Mark employee as disabled if they are already scheduled
            employee.disabled = this.scheduledEmployees.includes(employee.id);
        
            return employee;
          }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));
        
          // Select the first non-disabled employee by default
          this.selectedEmployee = this.Employees.find(e => !e.disabled) || this.Employees[0];
        });
        
        
      }
    });

    this.Employees = this.Employees.map(employee => ({
      ...employee,
      disabled: this.scheduledEmployees.includes(employee.id)
    }));
  }
  
  onEmployeeChange(event: any) {
    this.selectedEmployee = event.value;
    this.updateFormValues();
  }  

  updateFormValues() {
    if (!this.selectedEmployee || !this.scheduleForm) {
      return;
    }
  
    const selectedEmployee = this.selectedEmployee;
    this.scheduleForm.controls.uid.setValue(selectedEmployee.uid);
    this.scheduleForm.controls.employeeId.setValue(selectedEmployee.id);
  }
  
  onSubmit() {
    this.scheduleService.createSchedule(this.scheduleForm.value);
    this.dialogRef.close({scheduleCreated: true});
  }
}
