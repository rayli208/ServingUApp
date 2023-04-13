import { TimeStamp } from './../_models/time-stamp.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TimeStampService {
    constructor(private afs: AngularFirestore) { }

    //Get a TimeStamp by a doc ID
    getTimeStampDoc(id) {
        return this.afs
            .collection("TimeStamps")
            .doc(id)
            .valueChanges();
    }

    //Get ALL TimeStamps for a USER
    getTimeStampsListForUser(uid) {
        return this.afs
            .collection("timeStamp", ref => ref.where('uid', '==', uid))
            .snapshotChanges();
    }

    //Get ALL TimeStamps for a Date and EmployeeId
    getTimeStampsByDateAndEmployeeId(date, employeeId) {
        return this.afs
          .collection("timeStamp", ref =>
            ref
              .where('date', '==', date)
              .where('employeeId', '==', employeeId)
          )
          .snapshotChanges()
          .pipe(
            map(actions => actions.filter(action => {
              const data = action.payload.doc.data() as TimeStamp;
              return data.endTime === '';
            }))
          );
      }

    //Get TimeStamps for a EMPLOYEE
    getTimeStampsListForEmployee(employeeId) {
        return this.afs
            .collection("timeStamp", ref => ref.where('employeeId', '==', employeeId))
            .snapshotChanges();
    }

    //Create a TimeStamp
    createTimeStamp(timeStamp: TimeStamp) {
        return this.afs
            .collection("timeStamp")
            .add(timeStamp);
    }

    //Update a TimeStamp
    updateTimeStamp(timeStamp: TimeStamp, employeeId) {
        return this.afs
            .collection("timeStamp")
            .doc(employeeId)
            .update({
                employeeName: timeStamp.employeeName,
                startTime: timeStamp.startTime,
                endTime: timeStamp.endTime,
                date: timeStamp.date,
            });
    }
}
