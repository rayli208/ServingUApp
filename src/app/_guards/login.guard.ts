import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private afAuth: AngularFireAuth) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      
    return this.afAuth.authState.pipe(
      take(1),
      map(user => {
        if (user) {
          this.router.navigate(['/profile-dashboard']);  // If the user is logged in, navigate to profile-dashboard
          return false;
        } else {
          return true;
        }
      })
    );
  }
}
