import { AuthService } from './../services/auth.service';
import { JobsService } from './../services/jobs.service';
import { Job } from './../models/job.model';
import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    userId;
    user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
    Jobs: Job[];

    constructor(private afAuth: AngularFireAuth,
                private firestore: AngularFirestore,
                private jobsService: JobsService,
                private authService: AuthService
    ) {
        this.user = null;
    }

    ngOnInit(): void {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.userId = user.uid;
                let emailLower = user.email.toLowerCase();
                this.user = this.firestore.collection('users').doc(emailLower).valueChanges();
            }
        });

        this.jobsService.getJobsList().subscribe(res => {
            this.Jobs = res.map(e => {
                return{
                    // id: e.payload.doc.id,
                    ...e.payload.doc.data() as {}
                } as Job;
            })
        })
    }

    removeJob(job){ 
        if(confirm("Are you sure you want to delete " + job.title)){
            this.jobsService.deleteJob(job);
        }
    }
}
