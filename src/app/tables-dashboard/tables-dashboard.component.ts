import { CreateTableDialogComponent } from '../_dialogs/tables/create-table-dialog/create-table-dialog.component';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Table } from '../_models/table.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { TablesService } from '../_services/tables.service';



@Component({
  selector: 'app-tables-dashboard',
  templateUrl: './tables-dashboard.component.html',
  styleUrls: ['./tables-dashboard.component.scss']
})
export class TablesDashboardComponent implements OnInit {
  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
  totalTables: Table[];
  currentFloor: number = 1;
  gridSize: number = 50; // Define the grid size, adjust this value to your needs

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private tablesService: TablesService,

  ) {
    this.user = null;
  }

  @ViewChild('tableView', { read: ElementRef }) tableView: ElementRef;


  ngOnInit(): void {

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.tablesService.getTablesListForUser(this.userId).subscribe(res => {
          this.totalTables = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Table;
          }).sort((a, b) => {
            return a.tableNumber - b.tableNumber;
          });
        });
      }
    });

    // Check if the currentFloor value is in the local storage
    const savedFloor = localStorage.getItem('currentFloor');
    if (savedFloor) {
      this.currentFloor = parseInt(savedFloor, 10);
    }
  }

  decreaseFloorPlan() {
    if (this.currentFloor > 1) {
      this.currentFloor -= 1;
      localStorage.setItem('currentFloor', this.currentFloor.toString());
    }
  }

  increaseFloorPlan() {
    this.currentFloor += 1;
    localStorage.setItem('currentFloor', this.currentFloor.toString());
  }

  dragEnd(event: CdkDragEnd, table: any) {
    const droppedTable = event.source.element.nativeElement;
    const tableViewRect = this.tableView.nativeElement.getBoundingClientRect();
    const droppedTableRect = droppedTable.getBoundingClientRect();

    let newPositionX = (droppedTableRect.left - tableViewRect.left) - 2;
    let newPositionY = (droppedTableRect.top - tableViewRect.top) - 2;

    // Adjust the new positions according to the grid size
    newPositionX = Math.round(newPositionX / this.gridSize) * this.gridSize;
    newPositionY = Math.round(newPositionY / this.gridSize) * this.gridSize;

    // Manually reset the table's position
    event.source._dragRef.reset();

    table.positionX = newPositionX;
    table.positionY = newPositionY;

    this.tablesService.updateTable(table, table.id);
  }


  toggleActive(table: Table) {
    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }

  createTable(): void {
    const dialogRef = this.dialog.open(CreateTableDialogComponent, {});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => { });
  }
}
