import { EditJobDialogComponent } from '../_dialogs/jobs/edit-job-dialog/edit-job-dialog.component';
import { JobsService } from '../_services/jobs.service';
import { Job } from '../_models/job.model';
import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateJobDialogComponent } from '../_dialogs/jobs/create-job-dialog/create-job-dialog.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class HiringDashboardComponent implements OnInit {
    userId;
    user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
    Jobs: Job[];

    constructor(
        public dialog: MatDialog,
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private jobsService: JobsService,
    ) {
        this.user = null;
    }

    ngOnInit(): void {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.userId = user.uid;
                let emailLower = user.email.toLowerCase();
                this.user = this.afs.collection('users').doc(emailLower).valueChanges();

                this.jobsService.getJobsListForUser(this.userId).subscribe(res => {
                    this.Jobs = res.map(e => {
                        console.log(e.payload.doc.data());
                        return {
                            id: e.payload.doc.id,
                            ...e.payload.doc.data() as {}
                        } as Job;
                    })
                });
            }
        });
    }

    createJob(): void {
        const dialogRef = this.dialog.open(CreateJobDialogComponent, {});
        //Run code after closing dialog
        dialogRef.afterClosed().subscribe(result => { });
    }

    editJob(job: Job) {
        const dialogRef = this.dialog.open(EditJobDialogComponent, {
            data: job
        });
        //Run code after closing dialog
        dialogRef.afterClosed().subscribe(result => { });
    }

    removeJob(job) {
        if (confirm("Are you sure you want to delete " + job.title)) {
            this.jobsService.deleteJob(job);
        }
    }
}
