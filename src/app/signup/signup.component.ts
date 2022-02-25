import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service'
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

    isProgressVisible: boolean;
    signupForm: FormGroup;
    firebaseErrorMessage: string;

    constructor(private authService: AuthService, private router: Router) {
        this.isProgressVisible = false;
        this.firebaseErrorMessage = '';
    }

    ngOnInit(): void {
        if (this.authService.userLoggedIn) {                       // if the user's logged in, navigate them to the dashboard (NOTE: don't use afAuth.currentUser -- it's never null)
            this.router.navigate(['/dashboard']);
        }

        this.signupForm = new FormGroup({
            'owner': new FormControl('', Validators.required),
            'location_name': new FormControl('', Validators.required),
            'email': new FormControl('', [Validators.required, Validators.email]),
            'phone': new FormControl('', Validators.required),
            'website': new FormControl('', Validators.required),
            'school': new FormControl('', Validators.required),
            'openings': new FormControl('', Validators.required),
            'password': new FormControl('', Validators.required),
        });
    }

    signup() {
        if (this.signupForm.invalid)                            // if there's an error in the form, don't submit it
            return;

        this.isProgressVisible = true;
        this.authService.signupUser(this.signupForm.value).then((result) => {
            if (result == null)                                 // null is success, false means there was an error
                this.router.navigate(['/hiring-dashboard']);
            else if (result.isValid == false)
                this.firebaseErrorMessage = result.message;

            this.isProgressVisible = false;                     // no matter what, when the auth service returns, we hide the progress indicator
        }).catch(() => {
            this.isProgressVisible = false;
        });
    }
}
