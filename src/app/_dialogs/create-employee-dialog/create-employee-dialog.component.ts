import { EmployeesService } from './../../_services/employees.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-employee-dialog',
  templateUrl: './create-employee-dialog.component.html',
  styleUrls: ['./create-employee-dialog.component.css']
})
export class CreateEmployeeDialogComponent implements OnInit {
  public employeeForm: FormGroup;
  
  constructor(
    public employeesService: EmployeesService,
    public formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<CreateEmployeeDialogComponent>,
  ) {
    this.employeeForm = this.formBuilder.group({
      uid: [''],
      name: [''],
      position: [''],
      hours: [''],
      phone: [''],
      email: [''],
      employeed: true
    })
  }

  //Set ID of owner of job on load
  ngOnInit() {
    this.setUserId();
  }
  
  //Create job and redirect to dashboard
  onSubmit() {
    console.log(this.employeeForm.value);
    this.employeesService.createEmployee(this.employeeForm.value);
    this.dialogRef.close();
  }

  //Set User ID so jobs have link to their owners
  setUserId(){
    this.afAuth.authState.subscribe(async user => {
      if (user && user.uid) {
        this.employeeForm.patchValue({
          uid: user.uid,
        });
      }
    });
  }

}