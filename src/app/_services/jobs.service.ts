import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { Job } from '../_models/job.model';
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  constructor(private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    ) { }

  
  getUserId(){
    this.afAuth.authState.subscribe(async user => {
      if (user.uid) {
        console.log(user.uid);
      }
    });
  }

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
