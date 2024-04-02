import { Schedule } from './../_models/schedule.model';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {
  private schedulesCollection: AngularFirestoreCollection<Schedule>;

  constructor(private afs: AngularFirestore,
  ) {
    this.schedulesCollection = afs.collection<Schedule>('schedules');
   }

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
    });
  }


  //Delete a schedule
  deleteSchedule(schedule: Schedule) {
    return this.afs
      .collection("schedules")
      .doc(schedule.id)
      .delete();
  }

  //Update a schedule
  updateSchedule(schedule: Schedule, employeeId) {
    return this.afs
      .collection("schedules")
      .doc(employeeId)
      .update({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        date: schedule.date,
        note: schedule.note,
      })
  }

  saveBatchSchedules(schedules: Schedule[]): Promise<void> {
    const batch = this.afs.firestore.batch();

    schedules.forEach((schedule) => {
      const docRef = this.schedulesCollection.doc().ref;
      batch.set(docRef, schedule);
    });

    return batch.commit().then(() => {
      console.log('Batch schedules saved successfully!');
    }).catch((error) => {
      console.error('Error saving batch schedules:', error);
    });
  }

  getSchedulesInRange(uid: string, startDate: Date, endDate: Date) {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];

    return this.afs.collection<Schedule>('schedules', ref => 
      ref.where('uid', '==', uid)
         .where('date', '>=', start)
         .where('date', '<=', end))
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Schedule;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );
  }
}
