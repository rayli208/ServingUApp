import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mass-text-dialog',
  templateUrl: './mass-text-dialog.component.html',
  styleUrls: ['./mass-text-dialog.component.scss']
})
export class MassTextDialogComponent {
  massTextMessage: string = '';
  selectAllChecked = false;
  isIndeterminate = false;

  constructor(
    public dialogRef: MatDialogRef<MassTextDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // Method to toggle the selection of all employees
  toggleAll() {
    this.data.employees.forEach(emp => {
      emp.selected = this.selectAllChecked;
    });
    this.checkSelection();
  }

  // Method to update the state of the "Select All" checkbox based on individual selections
  checkSelection() {
    const selectedCount = this.data.employees.filter(emp => emp.selected).length;
    this.selectAllChecked = selectedCount === this.data.employees.length;
    this.isIndeterminate = selectedCount > 0 && selectedCount < this.data.employees.length;
  }

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
