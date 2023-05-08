import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { Employee } from '../_models/employee.model';
import { EditTableDialogComponent } from '../_dialogs/tables/edit-table-dialog/edit-table-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tables-employee-view',
  templateUrl: './tables-employee-view.component.html',
  styleUrls: ['./tables-employee-view.component.scss']
})

export class TablesEmployeeViewComponent implements OnInit {
  @Input() employeesWithTables: { [id: string]: Employee & { assignedTables: Table[] } };
  @Input() employees: Employee[];

  constructor(public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
  }

  // Add the getObjectKeys() helper function
  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }


  editTable(table: Table) {
    const dialogRef = this.dialog.open(EditTableDialogComponent, {
      data: { table: table, employees: this.employees }
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }

}
