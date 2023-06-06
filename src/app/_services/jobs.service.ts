import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Job } from '../_models/job.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private _snackBar: MatSnackBar
  ) { }


  getUserId() {
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
        .then(() => {
          this._snackBar.open('Job has been created!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          });
        });
    });
  }

  deleteJob(job: Job) {
    return this.afs
      .collection("jobs")
      .doc(job.id)
      .delete()
      .then(() => {
        this._snackBar.open('Job has been deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
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
      })      
      .then(() => {
        this._snackBar.open('Job has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      });
  }
}
