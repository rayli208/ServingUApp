import { CreateTableDialogComponent } from './../_dialogs/tables/create-table-dialog/create-table-dialog.component';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-tables-dashboard',
  templateUrl: './tables-dashboard.component.html',
  styleUrls: ['./tables-dashboard.component.scss']
})
export class TablesDashboardComponent {


  constructor(
    public dialog: MatDialog,
) {
}

  @ViewChild('tableView', { read: ElementRef }) tableView: ElementRef;

  tables = [
    { number: 1,
      shape: "square",
      color: "#000000",
      bgColor: "#ffffff",
      seats: 6,
    }, 
    { number: 2,
      shape: "circle",
      color: "#000000",
      bgColor: "#ffffff",
      seats: 6,
    }, 
    { number: 3,
      shape: "circle",
      color: "#000000",
      bgColor: "#ffffff",
      seats: 6,
    }, 
    { number: 4,
      shape: "hexgon",
      color: "#000000",
      bgColor: "#ffffff",
      seats: 6,
    }, 
    { number: 5,
      shape: "hexgon",
      color: "#000000",
      bgColor: "#ffffff",
      seats: 6,
    },   ];

  dragEnd(event: CdkDragEnd, table: any) {
    const droppedTable = event.source.element.nativeElement;
    const tableViewRect = this.tableView.nativeElement.getBoundingClientRect();
    const droppedTableRect = droppedTable.getBoundingClientRect();

    console.log(`Table ${table.number} Position:`, {
      x: droppedTableRect.left - tableViewRect.left,
      y: droppedTableRect.top - tableViewRect.top
    });
  }

  createTable(): void {
    const dialogRef = this.dialog.open(CreateTableDialogComponent, {});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
}
}
