import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{
  constructor(public afAuth: AngularFireAuth, private router: Router) {

  }

  ngOnInit(): void {
    
  }

  logout(): void {
      this.afAuth.signOut();
      this.router.navigate(['/login']);                // when the user is logged in, navigate them to dashboard
  }
}
