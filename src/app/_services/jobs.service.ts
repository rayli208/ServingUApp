import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Job } from '../_models/job.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
  ) { }

  getJobDoc(id) {
    return this.afs
      .collection("jobs")
      .doc(id)
      .valueChanges();
  }

  getJobsListForUser(userId) {
    return this.afs
      .collection("jobs", ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }

  createJob(job: Job) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("jobs")
        .add(job)
        .then(resolve, reject);
    });
  }

  deleteJob(job: Job) {
    return this.afs
      .collection("jobs")
      .doc(job.id)
      .delete();
  }

  updateJob(job: Job, id) {
    return this.afs
      .collection("jobs")
      .doc(id)
      .update({
        title: job.title,
        icon: job.icon,
        description: job.description,
        totalPositions: job.totalPositions,
        employmentType: job.employmentType,
      });
  }
}
