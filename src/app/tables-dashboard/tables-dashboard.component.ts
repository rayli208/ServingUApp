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
          })
        });
      }
    });
  }

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
