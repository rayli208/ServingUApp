import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { Employee } from '../_models/employee.model';
import { MatDialog } from '@angular/material/dialog';
import { TablesService } from '../_services/tables.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
    public afAuth: AngularFireAuth,
  ) { }

  ngOnInit(): void {
  }

  getObjectKeys(obj: object): string[] {
    return Object.keys(obj);
  }

  toggleActive(table: Table) {
    if (table.assignedEmployee && ('name' in table.assignedEmployee) && (table.assignedEmployee.name === "Unassigned Table")) {
      return;
    }

    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }

  getFloors(tables: Table[]): number[] {
    const floors = tables.map(table => table.floorPlan);
    let uniqueFloors = [...new Set(floors)];
    return uniqueFloors.sort((a, b) => a - b);
  }

  getTablesByFloor(tables: Table[], floor: number): Table[] {
    let tablesOnFloor = tables.filter(table => table.floorPlan === floor);
    return tablesOnFloor.sort((a, b) => a.tableNumber - b.tableNumber);
  }
}
