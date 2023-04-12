import { TimeStamp } from './../_models/time-stamp.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root'
})
export class TimeStampService {
    horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    verticalPosition: MatSnackBarVerticalPosition = 'top';

    constructor(private afs: AngularFirestore,
        private _snackBar: MatSnackBar
    ) { }

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

    //Get TimeStamps for a EMPLOYEE
    getTimeStampsListForEmployee(employeeId) {
        return this.afs
            .collection("timeStamp", ref => ref.where('employeeId', '==', employeeId))
            .snapshotChanges();
    }

    //Create a TimeStamp
    createTimeStamp(timeStamp: TimeStamp) {
        return new Promise<any>((resolve, reject) => {
            this.afs
                .collection("timeStamp")
                .add(timeStamp)
                .then(() => {
                    this._snackBar.open('Clocked out!', '', {
                        horizontalPosition: this.horizontalPosition,
                        verticalPosition: this.verticalPosition,
                        duration: 2500,
                        panelClass: ['green-snackbar']
                    });
                });
        });
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
            })
            .then(() => {
                this._snackBar.open('TimeStamp has been edited!', '', {
                    horizontalPosition: this.horizontalPosition,
                    verticalPosition: this.verticalPosition,
                    duration: 2500,
                    panelClass: ['yellow-snackbar']
                });
            });
    }
}
