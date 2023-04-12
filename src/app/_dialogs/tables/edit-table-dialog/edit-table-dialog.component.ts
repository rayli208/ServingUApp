import { TablesService } from './../../../_services/tables.service';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Table } from 'src/app/_models/table.model';

@Component({
  selector: 'app-table-job-dialog',
  templateUrl: './edit-table-dialog.component.html',
  styleUrls: ['./edit-table-dialog.component.scss']
})
export class EditTableDialogComponent implements OnInit {
  public table: Table;
  public editForm: UntypedFormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Table,
    public formBuilder: UntypedFormBuilder,
    public tablesService:TablesService,
    public dialogRef: MatDialogRef<EditTableDialogComponent>,
    ) { 
    this.table = data;

    this.editForm = this.formBuilder.group({...this.table})
  }

  ngOnInit(): void {}

  onSubmit(){
    this.tablesService.updateTable(this.editForm.value, this.table.id);
    this.dialogRef.close();
  }
}
