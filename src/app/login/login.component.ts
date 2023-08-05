import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    verticalPosition: MatSnackBarVerticalPosition = 'top';
    isProgressVisible: boolean;
    loginForm: UntypedFormGroup;
    firebaseErrorMessage: string;

    constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {

        this.isProgressVisible = false;

        this.loginForm = new UntypedFormGroup({
            'email': new UntypedFormControl('', [Validators.required, Validators.email]),
            'password': new UntypedFormControl('', Validators.required)
        });

        this.firebaseErrorMessage = '';
    }

    ngOnInit(): void {
        if (this.authService.userLoggedIn) {                       // if the user's logged in, navigate them to the dashboard (NOTE: don't use afAuth.currentUser -- it's never null)
            this.router.navigate(['/profile-dashboard']);
        }
    }

    loginUser() {
        this.isProgressVisible = true;  // show the progress indicator as we start the Firebase login process

        if (this.loginForm.invalid) {
            this.isProgressVisible = false;
            this._snackBar.open('Please fill in all fields.', '', {
                horizontalPosition: this.horizontalPosition,
                verticalPosition: this.verticalPosition,
                duration: 2500,
                panelClass: ['red-snackbar']
            });
            return;
        }

        this.authService.loginUser(this.loginForm.value.email, this.loginForm.value.password).then((result) => {
            this.isProgressVisible = false;
            if (result == null) {
                console.log('logging in...');
                this.router.navigate(['/profile-dashboard']);
            }
            else if (result.isValid == false) {
                console.log('login error', result);
                this.firebaseErrorMessage = result.message;
                this._snackBar.open('Failed to login! Please check your email and password.', '', {
                    horizontalPosition: this.horizontalPosition,
                    verticalPosition: this.verticalPosition,
                    duration: 2500,
                    panelClass: ['red-snackbar']
                });
            }
        }).catch(error => {
            console.error('Error during login: ', error);
            this.isProgressVisible = false;
            this._snackBar.open('Failed to login! Please check your email and password.', '', {
                horizontalPosition: this.horizontalPosition,
                verticalPosition: this.verticalPosition,
                duration: 2500,
                panelClass: ['red-snackbar']
            });
        });

    }
}
