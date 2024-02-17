import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mass-text-dialog',
  templateUrl: './mass-text-dialog.component.html',
  styleUrls: ['./mass-text-dialog.component.scss']
})
export class MassTextDialogComponent {
  massTextMessage: string = '';

  constructor(
    public dialogRef: MatDialogRef<MassTextDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Check if any employee is selected
  get isAnyEmployeeSelected(): boolean {
    return this.data.employees.some(emp => emp.selected);
  }

  // Method to prepare and return the result when closing the dialog
  prepareResult() {
    const selectedEmployees = this.data.employees.filter(emp => emp.selected);
    return { selectedEmployees, message: this.massTextMessage };
  }
}
