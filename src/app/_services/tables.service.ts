import { Table } from './../_models/table.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TablesService {

  constructor(
    private afs: AngularFirestore,
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
          resolve();
        })
        .catch(error => {
          console.error('Error creating table:', error);
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
      })
      .catch(error => {
        console.error('Error deleting table:', error);
      });
  }

  updateTable(table: Table, id: string) {
    return this.afs
      .collection("tables")
      .doc(id)
      .update({
        assignedEmployeeId: table.assignedEmployeeId,
        tableNumber: table.tableNumber,
        shape: table.shape,
        seats: table.seats,
        floorPlan: table.floorPlan,
        isActive: table.isActive,
        positionX: table.positionX,
        positionY: table.positionY
      })
  }
}
