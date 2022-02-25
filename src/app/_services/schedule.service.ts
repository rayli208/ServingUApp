import { Schedule } from './../_models/schedule.model';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  constructor(private afs: AngularFirestore,
    private toastr: NotificationService
  ) { }

  getScheduleDoc(id) {
    return this.afs
      .collection("schedules")
      .doc(id)
      .valueChanges();
  }

  getSchedulesListForUser(employeeId) {
    return this.afs
      .collection("schedules", ref => ref.where('uid', '==', employeeId))
      .snapshotChanges();
  }

  createSchedule(schedule: Schedule) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("schedules")
        .add(schedule)
        .then(() => {           
          this.toastr.showSuccess('', 'Schedule has been submited!')
        , error => {
          this.toastr.showError('Please contact IT for further assistance.', 'There has been an error creating the Schedule.')
          return reject(error);
        } });
    });
  }

  deleteSchedule(schedule: Schedule) {
    this.toastr.showWarning('','Schedule has been deleted.');
    return this.afs
      .collection("schedules")
      .doc(schedule.id).
      delete();
  }

  updateSchedule(schedule: Schedule, employeeId) {
    this.toastr.showInfo('','Schedule has been edited.')
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
