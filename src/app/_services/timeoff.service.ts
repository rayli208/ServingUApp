import { Timeoff } from './../_models/timeoff.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TimeoffService {
  constructor(private afs: AngularFirestore,
  ) { }

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
}
