import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { Employee } from '../_models/employee.model';
import { EditTableDialogComponent } from '../_dialogs/tables/edit-table-dialog/edit-table-dialog.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TablesService } from '../_services/tables.service';

@Component({
  selector: 'app-tables-employee-view',
  templateUrl: './tables-employee-view.component.html',
  styleUrls: ['./tables-employee-view.component.scss']
})

export class TablesEmployeeViewComponent implements OnInit {
  @Input() employeesWithTables: { [id: string]: Employee & { assignedTables: Table[] } };
  @Input() employees: Employee[];

  constructor(
    public dialog: MatDialog,
    private tablesService: TablesService,
  ) { }

  ngOnInit(): void {
  }

  // Add the getObjectKeys() helper function
  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  toggleActive(table: Table) {
    //If the table is not assigned to anyone, it returns and does not toggle the table
    if (table.assignedEmployee && ('name' in table.assignedEmployee) && (table.assignedEmployee.name === "Unassigned Table")) {
      return;
    }

    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }
}
