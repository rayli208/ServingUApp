import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { Employee } from '../_models/employee.model';

@Component({
  selector: 'app-tables-employee-view',
  templateUrl: './tables-employee-view.component.html',
  styleUrls: ['./tables-employee-view.component.scss']
})
export class TablesEmployeeViewComponent implements OnInit {
  @Input() tables: Table[];
  @Input() employees: Employee[];

  constructor() { }

  ngOnInit(): void {
  }

}
