import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from './_services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit{
  constructor(public afAuth: AngularFireAuth, private router: Router, private authService: AuthService) {

  }

  ngOnInit() {

  }
  
  checkLocalStorage(key: string): boolean {
    const value = localStorage.getItem(key);
    return value === 'true';
  }

  logout(): void {
      this.afAuth.signOut();
      this.router.navigate(['/login']);                // when the user is logged in, navigate them to dashboard
  }
}
