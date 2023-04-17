import { Schedule } from './../_models/schedule.model';
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
export class ScheduleService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private afs: AngularFirestore,
    private _snackBar: MatSnackBar
  ) { }

  //Get a schedule by a doc ID
  getScheduleDoc(id) {
    return this.afs
      .collection("schedules")
      .doc(id)
      .valueChanges();
  }

  //Get all schedules for a user
  getSchedulesListForUser(uid) {
    return this.afs
      .collection("schedules", ref => ref.where('uid', '==', uid))
      .snapshotChanges();
  }

  //Get Schedules for employee, orderd by date
  getSchedulesListForEmployee(employeeId) {
    return this.afs
      .collection("schedules", ref => ref.where('employeeId', '==', employeeId))
      .snapshotChanges();
  }

  //Create a schedule
  createSchedule(schedule: Schedule) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("schedules")
        .add(schedule)
        .then(() => {
          this._snackBar.open('Schedule has been created!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          });
        });
    });
  }


  //Delete a schedule
  deleteSchedule(schedule: Schedule) {
    return this.afs
      .collection("schedules")
      .doc(schedule.id)
      .delete()
      .then(() => {
        this._snackBar.open('Schedule has been deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
  }

  //Update a schedule
  updateSchedule(schedule: Schedule, employeeId) {
    return this.afs
      .collection("schedules")
      .doc(employeeId)
      .update({
        employeeName: schedule.employeeName,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        date: schedule.date,
        note: schedule.note,
      })
      .then(() => {
        this._snackBar.open('Schedule has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      });
  }
}
