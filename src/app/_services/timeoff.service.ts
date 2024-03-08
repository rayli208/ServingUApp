import { Timeoff } from './../_models/timeoff.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TimeoffService {
  private timeoffCollection: AngularFirestoreCollection<Timeoff>;

  constructor(private afs: AngularFirestore,
  ) {
    this.timeoffCollection = afs.collection<Timeoff>('timeoff');
   }

  //Get a timeoff by a doc ID
  getTimeoffDoc(id) {
    return this.afs
      .collection("timeoff")
      .doc(id)
      .valueChanges();
  }

  //Get all timeoff for a user
  getTimeoffListForUser(uid) {
    return this.afs
      .collection("timeoff", ref => ref.where('uid', '==', uid))
      .snapshotChanges();
  }

  //Get Timeoff for employee, orderd by date
  getTimeoffListForEmployee(employeeId) {
    return this.afs
      .collection("timeoff", ref => ref.where('employeeId', '==', employeeId))
      .snapshotChanges();
  }

  //Create a timeoff
  createTimeoff(timeoff: Timeoff) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("timeoff")
        .add(timeoff)
    });
  }


  //Delete a timeoff
  deleteTimeoff(timeoff: Timeoff) {
    return this.afs
      .collection("timeoff")
      .doc(timeoff.id)
      .delete();
  }

  //Update a timeoff
  updateTimeoff(timeoff: Timeoff, employeeId) {
    return this.afs
      .collection("timeoff")
      .doc(employeeId)
      .update({
        date: timeoff.date,
      })
  }

  saveBatchTimeoffs(timeOffs: Timeoff[]): Promise<void> {
    const batch = this.afs.firestore.batch();

    timeOffs.forEach((timeOff) => {
      const docRef = this.timeoffCollection.doc().ref;
      batch.set(docRef, timeOff);
    });

    return batch.commit().then(() => {
      console.log('Batch time-offs saved successfully!');
    }).catch((error) => {
      console.error('Error saving batch time-offs:', error);
    });
  }
}
