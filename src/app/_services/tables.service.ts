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
        employeeId: table.employeeId,
        tableNumber: table.tableNumber,
        shape: table.shape,
        seats: table.seats,
        floorPlan: table.floorPlan,
        isActive: table.isActive,
        positionX: table.positionX,
        positionY: table.positionY
      })
  }

  async updateTablesOnEmployeeClockOut(userId: string, employeeId: string): Promise<void> {
    const db = this.afs.firestore;
    const batch = db.batch();
    
    try {
      const snapshot = await this.afs.collection('tables', ref => 
        ref.where('uid', '==', userId).where('employeeId', '==', employeeId)
      ).get().toPromise();

      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          employeeId: null, 
          isActive: false 
        });
      });

      await batch.commit();
      console.log(`Successfully updated tables for employee ${employeeId}`);
    } catch (error) {
      console.error('Error updating tables on employee clock out:', error);
      throw error;
    }
  }

  async updateTablesOnEmployeeRemoval(userId: string, employeeId: string): Promise<void> {
    const db = this.afs.firestore;
    const batch = db.batch();
    
    try {
      const snapshot = await this.afs.collection('tables', ref => 
        ref.where('uid', '==', userId).where('employeeId', '==', employeeId)
      ).get().toPromise();
  
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { 
          employeeId: null, 
          isActive: false 
        });
      });
  
      await batch.commit();
      console.log(`Successfully updated tables for removed employee ${employeeId}`);
    } catch (error) {
      console.error('Error updating tables on employee removal:', error);
      throw error;
    }
  }
}
