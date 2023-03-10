import { Table } from './../_models/table.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class TablesService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private afs: AngularFirestore,
    private _snackBar: MatSnackBar
  ) { }

  getTableDoc(id) {
    return this.afs
      .collection("tables")
      .doc(id)
      .valueChanges();
  }

  getTablesListForUser(userId) {
    return this.afs
      .collection("tables", ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }

  createTable(table: Table) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("tables")
        .add(table)
        .then(() => {
          this._snackBar.open('table has been created!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          })
            , error => {
              console.log("'Please contact IT for further assistance.', 'There has been an error creating the table.")
              return reject(error);
            }
        });
    });
  }

  deleteTable(table: Table) {
    return this.afs
      .collection("tables")
      .doc(table.id)
      .delete()
      .then(() => {
        this._snackBar.open('Table has been deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
  }

  updateTable(table: Table, id) {
    return this.afs
      .collection("tables")
      .doc(id)
      .update({
        tableNumber: table.tableNumber,
        shape: table.shape,
        color: table.color,
        seats: table.seats,
        floorPlan: table.floorPlan,
        isActive: table.isActive,
        positionX: table.positionX,
        positionY: table.positionY
      }).then(() => {
        this._snackBar.open('Table has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      });
  }
}
