import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Job } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  constructor(private afs: AngularFirestore) { }

  getJobDoc(id) {
    return this.afs
      .collection("jobs")
      .doc(id)
      .valueChanges();
  }

  getJobsList() {
    return this.afs
      .collection("jobs")
      .snapshotChanges();
  }

  createJob(job: Job) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("jobs")
        .add(job)
        .then(response => { console.log(response), error => reject(error) });
    });
  }

  deleteJob(job: Job) {
    return this.afs
      .collection("jobs")
      .doc(job.id).
      delete();
  }

  updateJob(job: Job, id) {
    return this.afs
      .collection("jobs")
      .doc(id)
      .update({
        title: job.title,
        location: job.location,
        description: job.description,
        school: job.school,
        hours: job.hours,
        phone: job.phone,
        email: job.email,
        hired: job.hired
      })
  }
}
