import { Component, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Employee } from 'src/app/_models/employee.model';
import { EmployeesService } from 'src/app/_services/employees.service';
import { TablesService } from 'src/app/_services/tables.service';
import { Table } from 'src/app/_models/table.model';

@Component({
  selector: 'app-mass-select-dialog',
  templateUrl: './mass-select-dialog.component.html',
  styleUrls: ['./mass-select-dialog.component.scss']
})
export class MassSelectDialogComponent {
  public selectedEmployee: Employee;
  public userId: string;
  public user: Observable<any>;
  public Employees: Employee[];
  public filteredEmployees: Employee[];
  public Tables: Table[];
  public groupedTables: {[key: number]: Table[]} = {};
  public selectedTables: Table[] = [];
  public formReady: boolean = false;

  constructor(
    private afAuth: AngularFireAuth,
    private employeesService: EmployeesService,
    private tablesService: TablesService,
    public formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<MassSelectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.user = null;
  }

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
          this.Employees = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Employee;
          }).sort((a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0));

          // Filter employees based on 'clockedIn' property
          this.filteredEmployees = this.Employees.filter(employee => employee.clockedIn === true);

          if (this.filteredEmployees.length > 0) {
            this.selectedEmployee = this.filteredEmployees[0];
          }
        });

        this.tablesService.getTablesListForUser(this.userId).subscribe(res => {
          const tables = res.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as {}
            } as Table;
          });
          
          // Group the tables by floorPlan.
          this.groupedTables = tables.reduce((grouped, table) => {
            const key = table.floorPlan;
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(table);
            grouped[key].sort((a, b) => a.tableNumber - b.tableNumber); // Sort tables by table number.
            return grouped;
          }, {});
          
        });
      }
    });
  }

  onTableCheckboxChange(event: any, table: Table) {
    if (event.checked) {
      this.selectedTables.push(table);
    } else {
      this.selectedTables = this.selectedTables.filter(t => t.id !== table.id);
    }
    this.checkFormReady();
  }

  onEmployeeChange(event: any) {
    this.selectedEmployee = event.value;
    this.checkFormReady();
  }

  checkFormReady() {
    this.formReady = this.selectedEmployee && this.selectedTables.length > 0;
  }

  onSubmit() {
    if (this.formReady) {
      const updates = this.selectedTables.map(table => {
        table.assignedEmployee = this.selectedEmployee;
        return this.tablesService.updateTable(table, table.id);
      });
      Promise.all(updates).then(() => {
        this.dialogRef.close();
      }).catch(error => {
        console.error('Error updating tables:', error);
      });
    }
  }
}
