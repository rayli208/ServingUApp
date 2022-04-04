import { EditJobDialogComponent } from '../_dialogs/jobs/edit-job-dialog/edit-job-dialog.component';
import { JobsService } from '../_services/jobs.service';
import { Job } from '../_models/job.model';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateJobDialogComponent } from '../_dialogs/jobs/create-job-dialog/create-job-dialog.component';
import { MatAccordion } from '@angular/material/expansion';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class HiringDashboardComponent implements OnInit {
    userId;
    user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
    Jobs: Job[];
    activeJobs: Job[];
    archivedJobs: Job[];
    allTheWayLeft: boolean = true;
    allTheWayRight: boolean = false;
    @ViewChild(MatAccordion) accordion: MatAccordion;


    constructor(
        public dialog: MatDialog,
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private jobsService: JobsService,
    ) {
        this.user = null;
    }

    isMobile = false;
    getIsMobile(): boolean {
        const w = document.documentElement.clientWidth;
        const breakpoint = 1200;
        if (w < breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    ngOnInit(): void {
        this.isMobile = this.getIsMobile();
        window.onresize = () => {
            this.isMobile = this.getIsMobile();
        };

        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.userId = user.uid;
                let emailLower = user.email.toLowerCase();
                this.user = this.afs.collection('users').doc(emailLower).valueChanges();

                this.jobsService.getJobsListForUser(this.userId).subscribe(res => {
                    this.Jobs = res.map(e => {
                        return {
                            id: e.payload.doc.id,
                            ...e.payload.doc.data() as {}
                        } as Job;
                    })

                    this.activeJobs = this.Jobs.filter((job) => job.archived === false);
                    this.archivedJobs = this.Jobs.filter((job) => job.archived === true);
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

    archiveJob(job) {
        job.archived = !job.archived;
        this.jobsService.updateJob(job, job.id);
    }

    //ALL SCROLLING ACTIONS
    @HostListener('window:scroll', ['$event']) 
    scrollHandler(event) {
        var scroller = document.getElementById('dashboard-job-wrapper_scroller');
        var maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
        this.checkArrows(scroller, maxScrollLeft);    }

    scrollLeft() {
        var cardWidth = (document.querySelector(".dashboard-job-card-container") as HTMLElement).offsetWidth;
        var scroller = document.getElementById('dashboard-job-wrapper_scroller');
        var maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
        scroller.scrollLeft -= cardWidth;
        this.checkArrows(scroller, maxScrollLeft);
    }

    scrollRight() {
        var cardWidth = (document.querySelector(".dashboard-job-card-container") as HTMLElement).offsetWidth;
        var scroller = document.getElementById('dashboard-job-wrapper_scroller');
        var maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
        scroller.scrollLeft += cardWidth;
        this.checkArrows(scroller, maxScrollLeft);
    }

    checkArrows(scroller, maxScrollLeft){
        if(scroller.scrollLeft == 0)
        {
            this.allTheWayLeft = true;
        }else{
            this.allTheWayLeft = false;
        }

        if(scroller.scrollLeft == maxScrollLeft){
            this.allTheWayRight = true;
        }else{
            this.allTheWayRight = false;
        }
    }
}
