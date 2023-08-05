import { EditJobDialogComponent } from '../_dialogs/jobs/edit-job-dialog/edit-job-dialog.component';
import { JobsService } from '../_services/jobs.service';
import { Job } from '../_models/job.model';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateJobDialogComponent } from '../_dialogs/jobs/create-job-dialog/create-job-dialog.component';
import { MatAccordion } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
    selector: 'app-dashboard',
    templateUrl: './hiring-dashboard.component.html',
    styleUrls: ['./hiring-dashboard.component.scss']
})
export class HiringDashboardComponent implements OnInit {
    userId;
    user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
    Jobs: Job[];
    allTheWayLeft: boolean = true;
    allTheWayRight: boolean = false;
    @ViewChild(MatAccordion) accordion: MatAccordion;
    horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    verticalPosition: MatSnackBarVerticalPosition = 'top';


    constructor(
        public dialog: MatDialog,
        public afAuth: AngularFireAuth,
        public afs: AngularFirestore,
        public jobsService: JobsService,
        private _snackBar: MatSnackBar
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
                });
            }
        });
    }

    createJob(): void {
        const dialogRef = this.dialog.open(CreateJobDialogComponent, {});
        //Run code after closing dialog
        dialogRef.afterClosed().subscribe(result => {
            if (result?.jobCreated) {
                this._snackBar.open('Job has been created!', '', {
                    horizontalPosition: this.horizontalPosition,
                    verticalPosition: this.verticalPosition,
                    duration: 2500,
                    panelClass: ['green-snackbar']
                });
            }
        });
    }

    editJob(job: Job) {
        const dialogRef = this.dialog.open(EditJobDialogComponent, {
            data: job
        });
        //Run code after closing dialog
        dialogRef.afterClosed().subscribe(result => {
            if (result?.jobEdited) {
                this._snackBar.open('Job has been edited!', '', {
                    horizontalPosition: this.horizontalPosition,
                    verticalPosition: this.verticalPosition,
                    duration: 2500,
                    panelClass: ['yellow-snackbar']
                });
            }
        });
    }

    removeJob(job: Job) {
        if (confirm("Are you sure you want to delete " + job.title)) {
            this.jobsService.deleteJob(job).then(() => {
                this._snackBar.open('Job has been deleted!', '', {
                    horizontalPosition: this.horizontalPosition,
                    verticalPosition: this.verticalPosition,
                    duration: 2500,
                    panelClass: ['red-snackbar']
                });
            });
        }
    }

    //ALL SCROLLING ACTIONS
    @HostListener('window:scroll', ['$event'])
    scrollHandler(event) {
        var scroller = document.getElementById('dashboard-job-wrapper_scroller');
        var maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
        this.checkArrows(scroller, maxScrollLeft);
    }

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

    checkArrows(scroller, maxScrollLeft) {
        if (scroller.scrollLeft == 0) {
            this.allTheWayLeft = true;
        } else {
            this.allTheWayLeft = false;
        }

        if (scroller.scrollLeft == maxScrollLeft) {
            this.allTheWayRight = true;
        } else {
            this.allTheWayRight = false;
        }
    }
}
