import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Employee } from '../_models/employee.model';
import { EmployeesService } from '../_services/employees.service';
import { NotificationService } from '../_services/notification.service';

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
        private toastr: NotificationService,
        private employeesService: EmployeesService,

    ) {
        this.user = null;
    }

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
        this.toastr.showSuccess('', 'Copied Text!')
      }
}
