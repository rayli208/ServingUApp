import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    isProgressVisible: boolean;
    loginForm: UntypedFormGroup;
    firebaseErrorMessage: string;

    constructor(private authService: AuthService, private router: Router) {

        this.isProgressVisible = false;

        this.loginForm = new UntypedFormGroup({
            'email': new UntypedFormControl('', [Validators.required, Validators.email]),
            'password': new UntypedFormControl('', Validators.required)
        });

        this.firebaseErrorMessage = '';
    }

    ngOnInit(): void {
        if (this.authService.userLoggedIn) {                       // if the user's logged in, navigate them to the dashboard (NOTE: don't use afAuth.currentUser -- it's never null)
            this.router.navigate(['/hiring-dashboard']);
        }
    }

    loginUser() {
        this.isProgressVisible = true;                          // show the progress indicator as we start the Firebase login process

        if (this.loginForm.invalid)
            return;

        this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password).then((result) => {
            this.isProgressVisible = false;                     // no matter what, when the auth service returns, we hide the progress indicator
            if (result == null) {                               // null is success, false means there was an error
                console.log('logging in...');
                this.router.navigate(['/hiring-dashboard']);                // when the user is logged in, navigate them to dashboard
            }
            else if (result.isValid == false) {
                console.log('login error', result);
                this.firebaseErrorMessage = result.message;
            }
        });
    }
}
