import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, timer } from 'rxjs';
import { take, map } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { animate, style, transition, trigger } from '@angular/animations';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service';
import { environment } from 'src/environments/environment';

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
    version = environment.appVersion;
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
        private employeesService: EmployeesService,
        private sanitizer: DomSanitizer
    ) {
        this.user = null;
    }

    pinValue: string;
    employeesActive: boolean;
    scheduleActive: boolean;
    punchClockActive: boolean;
    tablesActive: boolean;
    reservationsActive: boolean;

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

        const features = ['employeesActive', 'scheduleActive', 'punchClockActive', 'tablesActive', 'reservationsActive'];
        features.forEach(feature => {
            const storedValue = localStorage.getItem(feature);
            this[feature] = storedValue !== null ? storedValue === 'true' : false;
        });
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

    toggleFeatureActive(featureName: string, isActive: boolean) {
        localStorage.setItem(featureName, isActive.toString());
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
    }

    goToDashboard(dashboardRoute: string) {
        this.router.navigate([`/${dashboardRoute}`]);
    }

    getSanitizedHtml(html: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
