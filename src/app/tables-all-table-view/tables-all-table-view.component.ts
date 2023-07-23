import { EditTableDialogComponent } from './../_dialogs/tables/edit-table-dialog/edit-table-dialog.component';
import { Component, Input, OnInit } from '@angular/core';
import { Table } from '../_models/table.model';
import { TablesService } from '../_services/tables.service';
import { MatDialog } from '@angular/material/dialog';
import { Employee } from '../_models/employee.model';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-tables-all-table-view',
  templateUrl: './tables-all-table-view.component.html',
  styleUrls: ['./tables-all-table-view.component.scss']
})
export class TablesAllTableViewComponent implements OnInit {
  @Input() tables: Table[];
  @Input() employees: Employee[];
  @Input() floorNumber: number;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    public dialog: MatDialog,
    private tablesService: TablesService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  //Remove Schedule 
  deleteTable(table: Table) {
    if (confirm("Are you sure you want to delete " + table.tableNumber + "?")) {
      this.tablesService.deleteTable(table);
      this._snackBar.open('Table has been deleted!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['red-snackbar']
      });
    }
  }

  editTable(table: Table) {
    const dialogRef = this.dialog.open(EditTableDialogComponent, {
      data: { table: table, employees: this.employees }
    });
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.tableEdited) {
          this._snackBar.open('Table has been edited!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['yellow-snackbar']
          });
      }
  });  }

  toggleActive(table: Table) {
    //If the table is not assigned to anyone, it returns and does not toggle the table
    if (table.assignedEmployee && ('name' in table.assignedEmployee) && (table.assignedEmployee.name === "Unassigned Table")) {
      return;
    }

    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }
}
