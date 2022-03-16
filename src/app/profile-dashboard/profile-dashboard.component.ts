import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile-dashboard',
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.css']
})
export class ProfileDashboardComponent implements OnInit {

  userId;
  user: Observable<any>;              // Example: store the user's info here (Cloud Firestore: collection is 'users', docId is the user's email, lower case)

  constructor(
      private afAuth: AngularFireAuth,
      private afs: AngularFirestore,
  ) {
      this.user = null;
  }


  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
        if (user) {
            this.userId = user.uid;
            let emailLower = user.email.toLowerCase();
            this.user = this.afs.collection('users').doc(emailLower).valueChanges();
        }
    });
}
}
