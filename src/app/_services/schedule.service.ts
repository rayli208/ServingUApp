import { Schedule } from './../_models/schedule.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private afs: AngularFirestore,
  ) { }

  //Get a schedule by a dog ID
  getScheduleDoc(id) {
    return this.afs
      .collection("schedules")
      .doc(id)
      .valueChanges();
  }

  //Get all schedules for a user
  getSchedulesListForUser(userId) {
    return this.afs
      .collection("schedules", ref => ref.where('userId', '==', userId))
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
        .add(schedule);
    });
  }

  //Delete a schedule
  deleteSchedule(schedule: Schedule) {
    return this.afs
      .collection("schedules")
      .doc(schedule.id).
      delete();
  }
  
  //Update a schedule
  updateSchedule(schedule: Schedule, employeeId) {
    console.log("Schedule has been edited.")
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
  }
}
