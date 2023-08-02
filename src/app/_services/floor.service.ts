import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Floor } from '../_models/floor.model';

@Injectable({
  providedIn: 'root'
})
export class FloorsService {
  constructor(private afs: AngularFirestore) { }

  // Function to create a new floor document
  createFloor(userId: string, floor: Floor): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.afs.collection("floors").add({ ...floor, uid: userId })
        .then(() => {
          resolve();
        })
        .catch(error => {
          console.error('Error creating floor:', error);
          reject(error);
        });
    });
  }

  // Function to get a floor document
  getFloor(userId: string, floorNumber: number) {
    return this.afs
      .collection("floors", ref => ref.where('uid', '==', userId).where('floorNumber', '==', floorNumber))
      .valueChanges();
  }

  // Function to get all floors for a user
  getFloorsForUser(userId: string) {
    return this.afs
      .collection("floors", ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }  

  // Function to update a floor document
  updateFloor(userId: string, floor: Floor) {
    return this.afs
      .collection("floors")
      .doc(floor.id)
      .update({
        floorNumber: floor.floorNumber,
        floorName: floor.floorName
      });
  }

  // Function to delete a floor document
  deleteFloor(userId: string, floor: Floor) {
    return this.afs
      .collection("floors")
      .doc(floor.id)
      .delete()
      .then(() => {
      })
      .catch(error => {
        console.error('Error deleting floor:', error);
      });
  }
}
