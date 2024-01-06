import { TablesService } from './../../../_services/tables.service';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Employee } from 'src/app/_models/employee.model';
import { Table } from 'src/app/_models/table.model';

@Component({
  selector: 'app-table-job-dialog',
  templateUrl: './edit-table-dialog.component.html',
  styleUrls: ['./edit-table-dialog.component.scss']
})
export class EditTableDialogComponent implements OnInit {
  public table: Table;
  public employees: Employee[];
  public editForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {table: Table, employees: Employee[]},
    public formBuilder: FormBuilder,
    public tablesService: TablesService,
    public dialogRef: MatDialogRef<EditTableDialogComponent>,
  ) { 
    this.table = data.table;
    this.employees = data.employees;

    // Note the change here to 'employeeId'
    this.editForm = this.formBuilder.group({
      employeeId: [this.table.employeeId],  
      tableNumber: [this.table.tableNumber],
      shape: [this.table.shape],
      seats: [this.table.seats],
      floorPlan: [this.table.floorPlan],
      isActive: [this.table.isActive],
      positionX: [this.table.positionX],
      positionY: [this.table.positionY]
    });
  }
  
  ngOnInit(): void {}

  onSubmit(){
    if (this.editForm.value.employeeId === null || this.editForm.value.employeeId === '') {  // check for unassigned table
      this.editForm.value.isActive = false;
    }

    this.tablesService.updateTable(this.editForm.value, this.table.id);
    this.dialogRef.close({tableEdited: true});
  }
}
