import { Component, OnInit } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

    user: Observable<any>;

    constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
        this.user = null;
    }

    ngOnInit(): void {
        this.afAuth.authState.subscribe(user => {                                                   // grab the user object from Firebase Authorization
            if (user) {
                let emailLower = user.email.toLowerCase();
                this.user = this.firestore.collection('users').doc(emailLower).valueChanges();      // get the user's doc in Cloud Firestore
            }
        });
    }
}
