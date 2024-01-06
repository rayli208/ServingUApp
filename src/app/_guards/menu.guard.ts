import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class MenuGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): Observable<boolean> {
        return this.authService.getCurrentUserAccountType().pipe(
            map(accountType => {
                if (['silver', 'gold'].includes(accountType)) {
                    return true;
                } else {
                    this.router.navigate(['/profile-dashboard']);
                    return false;
                }
            })
        );
    }
}
