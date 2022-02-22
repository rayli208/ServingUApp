import { Employee } from '../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmployeesService } from 'src/app/_services/employees.service';

@Component({
  selector: 'app-edit-employee-dialog',
  templateUrl: './edit-employee-dialog.component.html',
  styleUrls: ['./edit-employee-dialog.component.css']
})
export class EditEmployeeDialogComponent implements OnInit {
  public employee: Employee;
  public editForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Employee,
    public formBuilder: FormBuilder,
    public employeesService: EmployeesService,
    public dialogRef: MatDialogRef<EditEmployeeDialogComponent>,
  ) {
    this.employee = data;

    this.editForm = this.formBuilder.group({ ...this.employee })
  }

  ngOnInit(): void { }

  onSubmit() {
    this.employeesService.updateEmployee(this.editForm.value, this.employee.id);
    this.dialogRef.close();
  }
}
