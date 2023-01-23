import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { TablesService } from '../_services/tables.service';

@Component({
  selector: 'app-tables-all-table-view',
  templateUrl: './tables-all-table-view.component.html',
  styleUrls: ['./tables-all-table-view.component.scss']
})
export class TablesAllTableViewComponent implements OnInit {
  @Input() tables: Table[];

  constructor(
    private tablesService: TablesService,
  ) { }

  ngOnInit(): void {
    console.log("Tables: ", this.tables);
  }


  //Remove Schedule 
  deleteTable(table: Table) {
    if (confirm("Are you sure you want to delete " + table.tableNumber + "?")) {
      this.tablesService.deleteTable(table);
      console.log("Table has been  deleted");
    }
  }
}
