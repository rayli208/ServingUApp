import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, interval, timer } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Component({
    selector: 'app-profile-dashboard',
    templateUrl: './profile-dashboard.component.html',
    styleUrls: ['./profile-dashboard.component.scss'],
    animations: [
        trigger('slide', [
            transition(':increment', [
                style({ transform: 'translateX(100%)' }),
                animate('1s ease-out', style({ transform: 'translateX(0)' })),
            ]),
            transition(':decrement', [
                style({ transform: 'translateX(-100%)' }),
                animate('1s ease-out', style({ transform: 'translateX(0)' })),
            ]),
        ]),
    ],
})
export class ProfileDashboardComponent implements OnInit {
    userId: string;
    user: Observable<any>;
    Employees: Employee[];
    currentImageUrl: string;
    currentIndex: number = 0;

    constructor(
        private router: Router,
        public afAuth: AngularFireAuth,
        public authService: AuthService,
        private afs: AngularFirestore,
        private employeesService: EmployeesService
    ) {
        this.user = null;
    }

    pinValue: string;
    jobsActive: boolean;
    employeesActive: boolean;
    scheduleActive: boolean;
    punchClockActive: boolean;
    tablesActive: boolean;

    imageUrls$: Observable<string[]>;
    imageUrls: string[] = [];

    ngOnInit(): void {
        this.afAuth.authState.subscribe((user) => {
            if (user) {
                this.userId = user.uid;
                let emailLower = user.email.toLowerCase();
                this.user = this.afs.collection('users').doc(emailLower).valueChanges();
                this.employeesService.getEmployeesListForUser(this.userId).subscribe((res) => {
                    this.Employees = res.map((e) => {
                        return {
                            id: e.payload.doc.id,
                            ...(e.payload.doc.data() as {}),
                        } as Employee;
                    }).filter((x) => x.employeed);
                });

                this.imageUrls$ = this.authService.getImageUrls(this.userId);
                this.imageUrls$
                    .pipe(
                        take(1),
                        map((urls) => {
                            this.imageUrls = urls;
                            this.currentImageUrl = urls[this.currentIndex];
                            this.setInterval();
                        })
                    )
                    .subscribe();
            }
        });

        if (!localStorage.getItem('jobsActive')) {
            localStorage.setItem('jobsActive', 'false');
        }
        this.jobsActive = localStorage.getItem('jobsActive') === 'true';

        if (!localStorage.getItem('employeesActive')) {
            localStorage.setItem('employeesActive', 'false');
        }
        this.employeesActive = localStorage.getItem('employeesActive') === 'true';

        if (!localStorage.getItem('scheduleActive')) {
            localStorage.setItem('scheduleActive', 'false');
        }
        this.scheduleActive = localStorage.getItem('scheduleActive') === 'true';

        if (!localStorage.getItem('punchClockActive')) {
            localStorage.setItem('punchClockActive', 'false');
        }
        this.punchClockActive = localStorage.getItem('punchClockActive') === 'true';

        if (!localStorage.getItem('tablesActive')) {
            localStorage.setItem('tablesActive', 'false');
        }
        this.tablesActive = localStorage.getItem('tablesActive') === 'true';
    }

    updateCurrentImageUrl() {
        this.currentIndex++;
        // If we've gone past the end of the array, start over from the beginning.
        if (this.currentIndex >= this.imageUrls.length) {
            this.currentIndex = 0;
        }
        this.currentImageUrl = this.imageUrls[this.currentIndex];
    }

    setInterval() {
        timer(0, 5000).subscribe(() => this.updateCurrentImageUrl());
    }

    toggleJobsActive() {
        localStorage.setItem('jobsActive', this.jobsActive.toString());
    }

    toggleEmployeesActive() {
        localStorage.setItem('employeesActive', this.employeesActive.toString());
    }

    toggleScheduleActive() {
        localStorage.setItem('scheduleActive', this.scheduleActive.toString());
    }

    togglePunchClockActive() {
        localStorage.setItem('punchClockActive', this.punchClockActive.toString());
    }

    toggleTablesActive() {
        localStorage.setItem('tablesActive', this.tablesActive.toString());
    }

    // Make sure only numbers are being entered into the input value
    onInputChange(event: any) {
        const currentValue = event.target.value;
        const nextValue = currentValue.replace(/[^0-9]/g, '');
        if (currentValue !== nextValue) {
            this.pinValue = nextValue;
            event.target.value = nextValue;
        }
    }

    copyText(val: string) {
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
        console.log('Copied text');
    }

    goToProfileEditorDashboard() {
        this.router.navigate(['/profile-editor-dashboard']);
    }

    goToHoursEditorDashboard() {
        this.router.navigate(['/hours-dashboard']);
    }
}
