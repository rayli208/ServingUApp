import { EditTableDialogComponent } from './../_dialogs/tables/edit-table-dialog/edit-table-dialog.component';
import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { TablesService } from '../_services/tables.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-tables-all-table-view',
  templateUrl: './tables-all-table-view.component.html',
  styleUrls: ['./tables-all-table-view.component.scss']
})
export class TablesAllTableViewComponent implements OnInit {
  @Input() tables: Table[];
  @Input() floorNumber: number;


  constructor(
    public dialog: MatDialog,
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


  editTable(table: Table) {
    const dialogRef = this.dialog.open(EditTableDialogComponent, {
      data: table
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }

  toggleActive(table: Table){
    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }
}
