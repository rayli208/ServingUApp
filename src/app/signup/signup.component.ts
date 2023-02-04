import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service'
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { PhoneNumberFormatDirective } from '../_directives/phone-number.directive';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})

export class SignupComponent implements OnInit {

    isProgressVisible: boolean;
    signupForm: UntypedFormGroup;
    firebaseErrorMessage: string;

    constructor(private authService: AuthService, private router: Router) {
        this.isProgressVisible = false;
        this.firebaseErrorMessage = '';
    }

    ngOnInit(): void {
        if (this.authService.userLoggedIn) {                       // if the user's logged in, navigate them to the dashboard (NOTE: don't use afAuth.currentUser -- it's never null)
            this.router.navigate(['/profile-dashboard']);
        }

        this.signupForm = new UntypedFormGroup({
            'owner': new UntypedFormControl('', Validators.required),
            'location_name': new UntypedFormControl('', Validators.required),
            'email': new UntypedFormControl('', [Validators.required, Validators.email]),
            'phone': new UntypedFormControl('', Validators.required),
            'website': new UntypedFormControl('', Validators.required),
            'address': new UntypedFormControl('', Validators.required),
            'school': new UntypedFormControl('', Validators.required),
            'pin': new UntypedFormControl('', Validators.required),
            'password': new UntypedFormControl('', Validators.required),
        });
    }

    signup() {
        if (this.signupForm.invalid)                            // if there's an error in the form, don't submit it
            return;

        this.isProgressVisible = true;
        this.authService.signupUser(this.signupForm.value).then((result) => {
            if (result == null)                                 // null is success, false means there was an error
                this.router.navigate(['/profile-dashboard']);
            else if (result.isValid == false)
                this.firebaseErrorMessage = result.message;

            this.isProgressVisible = false;                     // no matter what, when the auth service returns, we hide the progress indicator
        }).catch(() => {
            this.isProgressVisible = false;
        });
    }
}
