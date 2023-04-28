import { Table } from './../_models/table.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class TablesService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private afs: AngularFirestore,
    private _snackBar: MatSnackBar
  ) { }

  getTableDoc(id: string) {
    return this.afs
      .collection("tables")
      .doc(id)
      .valueChanges();
  }

  getTablesListForUser(userId: string) {
    return this.afs
      .collection("tables", ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }

  createTable(table: Table): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs.collection("tables").add(table)
        .then(() => {
          this._snackBar.open('Table created successfully!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          });
          resolve();
        })
        .catch(error => {
          console.error('Error creating table:', error);
          this._snackBar.open('Error creating table. Please try again later.', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
          reject(error);
        });
    });
  }


  deleteTable(table: Table) {
    return this.afs
      .collection("tables")
      .doc(table.id)
      .delete()
      .then(() => {
        this._snackBar.open('Table deleted successfully!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      })
      .catch(error => {
        console.error('Error deleting table:', error);
        this._snackBar.open('Error deleting table. Please try again later.', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
  }

  updateTable(table: Table, id: string) {
    return this.afs
      .collection("tables")
      .doc(id)
      .update({
        assignedEmployee: table.assignedEmployee,
        tableNumber: table.tableNumber,
        shape: table.shape,
        seats: table.seats,
        floorPlan: table.floorPlan,
        isActive: table.isActive,
        positionX: table.positionX,
        positionY: table.positionY
      })
      .then(() => {
        this._snackBar.open('Table updated successfully!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      })
      .catch(error => {
        console.error('Error updating table:', error);
        this._snackBar.open('Error updating table. Please try again later.', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
  }
}
