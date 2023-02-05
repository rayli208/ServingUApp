import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';

@Component({
    selector: 'app-profile-dashboard',
    templateUrl: './profile-dashboard.component.html',
    styleUrls: ['./profile-dashboard.component.scss']
})
export class ProfileDashboardComponent implements OnInit {
    userId;
    user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)
    Employees: Employee[];

    constructor(
        private afAuth: AngularFireAuth,
        private afs: AngularFirestore,
        private employeesService: EmployeesService,

    ) {
        this.user = null;
    }
    jobsActive: boolean;
    employeesActive: boolean;
    timesheetActive: boolean;
    tablesActive: boolean;

    ngOnInit(): void {
        this.afAuth.authState.subscribe(user => {
            if (user) {
                this.userId = user.uid;
                let emailLower = user.email.toLowerCase();
                this.user = this.afs.collection('users').doc(emailLower).valueChanges();
                this.employeesService.getEmployeesListForUser(this.userId).subscribe(res => {
                    this.Employees = res.map(e => {
                        return {
                            id: e.payload.doc.id,
                            ...e.payload.doc.data() as {}
                        } as Employee;
                    }).filter(x => x.employeed);
                });
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


        if (!localStorage.getItem('timesheetActive')) {
            localStorage.setItem('timesheetActive', 'false');
        }
        this.timesheetActive = localStorage.getItem('timesheetActive') === 'true';


        if (!localStorage.getItem('tablesActive')) {
            localStorage.setItem('tablesActive', 'false');
        }
        this.tablesActive = localStorage.getItem('tablesActive') === 'true';

    }

    toggleJobsActive() {
        localStorage.setItem('jobsActive', this.jobsActive.toString());
    }

    toggleEmployeesActive() {
        localStorage.setItem('employeesActive', this.employeesActive.toString());
    }

    toggleTimesheetActive() {
        localStorage.setItem('timesheetActive', this.timesheetActive.toString());
    }

    toggleTablesActive() {
        localStorage.setItem('tablesActive', this.tablesActive.toString());
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
        console.log("Copied text");
    }
}
