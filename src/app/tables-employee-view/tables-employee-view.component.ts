import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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

export class TablesEmployeeViewComponent implements OnInit, OnChanges {
  @Input() employees: Employee[];
  @Input() tables: Table[];

  groupedTablesByEmployee: { [id: string]: Table[] } = {};

  constructor(
    public dialog: MatDialog,
    private tablesService: TablesService,
    public afAuth: AngularFireAuth,
  ) {}

  ngOnInit(): void {
    this.groupTablesByEmployee();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tables && changes.tables.currentValue !== changes.tables.previousValue) {
      this.groupTablesByEmployee();
    }
  }

  groupTablesByEmployee() {
    this.groupedTablesByEmployee = this.tables.reduce((acc, table) => {
      const id = table.employeeId;
      if (id) {
        acc[id] = acc[id] ? [...acc[id], table] : [table];
      }
      return acc;
    }, {});
  }

  toggleActive(table: Table) {
    console.log(table.employeeId)

    if (table.employeeId == null) {
      return;
    }

    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }

  getFloors(tables: Table[]): number[] {
    const floors = tables.map(table => table.floorPlan);
    return [...new Set(floors)].sort((a, b) => a - b);
  }

  getTablesByFloor(tables: Table[], floor: number): Table[] {
    const tablesOnFloor = tables.filter(table => table.floorPlan === floor);
    return tablesOnFloor;
  }
}
