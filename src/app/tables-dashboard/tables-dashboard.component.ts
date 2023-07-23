import { CreateTableDialogComponent } from '../_dialogs/tables/create-table-dialog/create-table-dialog.component';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Table } from '../_models/table.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { TablesService } from '../_services/tables.service';
import { EmployeesService } from '../_services/employees.service';
import { Employee } from '../_models/employee.model';
import { MassSelectDialogComponent } from '../_dialogs/tables/mass-select-dialog/mass-select-dialog.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

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
  gridSize: number = 25; // Define the grid size, adjust this value to your needs
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  //Employee Portion
  clockedInEmployees: Employee[] = [];
  //Employee and table jumbled object
  employeesWithTables: { [id: string]: Employee & { assignedTables: Table[] } } = {};

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private tablesService: TablesService,
    private employeesService: EmployeesService,
    private _snackBar: MatSnackBar
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
            .sort((a, b) => {
              if (a.isActive === b.isActive) {
                return a.tableNumber - b.tableNumber;
              }
              return b.isActive ? 1 : -1;
            });
          this.updateEmployeesWithTables();
        });

        this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
          this.clockedInEmployees = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Employee;
          })
            .filter(employee => employee.clockedIn === true && employee.employeed === true)
            .sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

          // After fetching the clockedInEmployees and totalTables, create the employeesWithTables object
          const employeesWithTables: { [id: string]: Employee & { assignedTables: Table[] } } = {};

          this.clockedInEmployees.forEach(employee => {
            const employeeWithTables = { ...employee, assignedTables: [] };

            this.totalTables.forEach(table => {
              if (table.assignedEmployee && ('id' in table.assignedEmployee) && (table.assignedEmployee.id === employee.id)) {
                // Push the entire table object instead of just the table number and floor
                employeeWithTables.assignedTables.push(table);
              }
            });

            employeesWithTables[employee.id] = employeeWithTables;
          });

          this.updateEmployeesWithTables();
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


  //Toggles Active Table
  toggleActive(table: Table) {
    //If the table is not assigned to anyone, it returns and does not toggle the table
    if (table.assignedEmployee && ('name' in table.assignedEmployee) && (table.assignedEmployee.name === "Unassigned Table")) {
      return;
    }

    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
  }

  //Creates Table
  createTable(): void {
    const dialogRef = this.dialog.open(CreateTableDialogComponent, {});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.tableCreated) {
          this._snackBar.open('Table has been created!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['green-snackbar']
          });
      }
  });  }

  //Updates EmployeesWithTables object
  updateEmployeesWithTables() {
    const employeesWithTables: { [id: string]: Employee & { assignedTables: Table[] } } = {};

    this.clockedInEmployees.forEach(employee => {
      const employeeWithTables = { ...employee, assignedTables: [] };

      this.totalTables.forEach(table => {
        if (table.assignedEmployee && ('id' in table.assignedEmployee) && (table.assignedEmployee.id === employee.id)) {
          employeeWithTables.assignedTables.push(table);
        }
      });

      employeesWithTables[employee.id] = employeeWithTables;
    });

    this.employeesWithTables = employeesWithTables;
  }

  openMassAssignDialog() {
    const dialogRef = this.dialog.open(MassSelectDialogComponent, {});
    //Run code after closing dialog
    dialogRef.afterClosed().subscribe(result => {
      if (result?.massAssign) {
          this._snackBar.open('Successfully mass assigned!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['green-snackbar']
          });
      }
  });  }
}
