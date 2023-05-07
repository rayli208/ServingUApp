import { TimeStamp } from './../_models/time-stamp.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Employee } from '../_models/employee.model';

@Injectable({
    providedIn: 'root'
})
export class TimeStampService {
    constructor(private afs: AngularFirestore) { }

    //Get a TimeStamp by a doc ID
    getTimeStampDoc(id: string) {
        return this.afs
            .collection<TimeStamp>("TimeStamps")
            .doc(id)
            .valueChanges();
    }

    //Get ALL TimeStamps for a USER
    getTimeStampsListForUser(uid: string) {
        return this.afs
            .collection<TimeStamp>("timeStamp", ref => ref.where('uid', '==', uid))
            .snapshotChanges();
    }

    //Get ALL TimeStamps for a Date and EmployeeId
    getTimeStampsByDateAndEmployeeId(date: Date, employeeId: string) {
        return this.afs
            .collection<TimeStamp>("timeStamp", ref =>
                ref
                    .where('date', '==', date)
                    .where('employeeId', '==', employeeId)
            )
            .snapshotChanges()
            .pipe(
                map(actions => actions.filter(action => {
                    const data = action.payload.doc.data() as TimeStamp;
                    return data.endTime === undefined;
                }))
            );
    }

    //Get TimeStamps for a EMPLOYEE
    getTimeStampsListForEmployee(employeeId: string) {
        return this.afs
            .collection<TimeStamp>("timeStamp", ref => ref.where('employeeId', '==', employeeId))
            .snapshotChanges();
    }

    //Create a TimeStamp
    createTimeStamp(timeStamp: TimeStamp) {
        return this.afs
            .collection<TimeStamp>("timeStamp")
            .add(timeStamp);
    }

    //Update a TimeStamp
    updateTimeStamp(timeStamp: TimeStamp, id) {
        return this.afs
            .collection("timeStamp")
            .doc(id)
            .update({
                employeeName: timeStamp.employeeName,
                startTime: timeStamp.startTime,
                endTime: timeStamp.endTime,
            });
    }

    // Create Time Stamp From Employee
    createTimeStampWithEmployee(employee: Employee, endTime: Date) {
        const timeStamp: TimeStamp = {
            uid: employee.uid,
            employeeId: employee.id,
            employeeName: employee.name,
            startTime: employee.clockedInTime, 
            endTime: endTime,
        };
        return this.createTimeStamp(timeStamp);
    }
}
