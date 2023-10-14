import { CreateTableDialogComponent } from '../_dialogs/tables/create-table-dialog/create-table-dialog.component';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Table } from '../_models/table.model';
import { Employee } from '../_models/employee.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { TablesService } from '../_services/tables.service';
import { EmployeesService } from '../_services/employees.service';
import { FloorsService } from '../_services/floor.service';
import { Floor } from '../_models/floor.model';
import { MassSelectDialogComponent } from '../_dialogs/tables/mass-select-dialog/mass-select-dialog.component';

@Component({
  selector: 'app-tables-dashboard',
  templateUrl: './tables-dashboard.component.html',
  styleUrls: ['./tables-dashboard.component.scss']
})
export class TablesDashboardComponent implements OnInit {
  userId;
  user: Observable<any>;
  totalTables: Table[] = [];
  filteredTables: Table[] = [];
  clockedInEmployees: Employee[] = [];
  currentFloor: number = 1;
  gridSize: number = 25;
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  floors: Floor[] = [];
  isActiveFilter: string = 'all'; 
  seatsFilter: number;

  constructor(
    public dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private tablesService: TablesService,
    private employeesService: EmployeesService,
    private floorsService: FloorsService,
    private _snackBar: MatSnackBar
  ) {
    this.user = null;
  }

  @ViewChild('tableView', { read: ElementRef }) tableView: ElementRef;

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.isActiveFilter = 'all';
        this.seatsFilter = null; // Initialize to null
        
        this.tablesService.getTablesListForUser(this.userId).subscribe(res => {
          this.totalTables = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Table;
          }).sort((a, b) => (a.isActive === b.isActive) ? a.tableNumber - b.tableNumber : b.isActive ? 1 : -1);
          
          console.log("Total Tables: ", this.totalTables);  // Debug log
          this.applyFilters();
        });

        this.floorsService.getFloorsForUser(this.userId).subscribe(res => {
          this.floors = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Floor;
          });
        });

        this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
          this.clockedInEmployees = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Employee;
          }).filter(employee => employee.clockedIn === true && employee.floorEmployee === true && employee.employeed === true);
        });
      }
    });
  }

  getEmployeeImgById(id: string): string {
    const employee = this.clockedInEmployees.find(e => e.id === id);
    return employee && employee.imgUrl ? employee.imgUrl : '';
  }

  getFloorName(floorNumber: number): string {
    const floor = this.floors.find(f => f.floorNumber === floorNumber);
    return floor ? floor.floorName + ` (${floorNumber})` : `Floor ${floorNumber}`;
  }

  toggleActive(table: Table) {
    //If the table is not assigned to anyone, it returns and does not toggle the table
    if (table.employeeId == null) {
      return;
    }

    table.isActive = !table.isActive;
    this.tablesService.updateTable(table, table.id);
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
    });
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
    });
  }

  applyFilters() {
    this.filteredTables = this.totalTables.filter(table => {
      let isActiveCondition = true;
      
      if (this.isActiveFilter !== 'all') {
        isActiveCondition = (table.isActive.toString() === this.isActiveFilter);
      }
  
      return isActiveCondition && (this.seatsFilter === null || table.seats >= this.seatsFilter);
    });
  }
  

  resetFilter() {
    this.isActiveFilter = 'all';
    this.seatsFilter = null;
    this.applyFilters();
  }
}