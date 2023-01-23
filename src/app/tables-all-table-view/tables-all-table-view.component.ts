import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';

@Component({
  selector: 'app-tables-all-table-view',
  templateUrl: './tables-all-table-view.component.html',
  styleUrls: ['./tables-all-table-view.component.scss']
})
export class TablesAllTableViewComponent implements OnInit {
  @Input() tables: Table[];

  constructor() { }

  ngOnInit(): void {
    console.log("Tables: ", this.tables);
  }

}
