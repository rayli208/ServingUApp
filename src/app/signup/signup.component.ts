import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../_services/auth.service'
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { PhoneNumberFormatDirective } from '../_directives/phone-number.directive';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {

    isProgressVisible: boolean;
    signupForm: FormGroup;
    firebaseErrorMessage: string;

    constructor(private authService: AuthService, private router: Router, private _formBuilder: FormBuilder) {
        this.isProgressVisible = false;
        this.firebaseErrorMessage = '';
    }

    ngOnInit(): void {
        if (this.authService.userLoggedIn) {
            this.router.navigate(['/profile-dashboard']);
        }

        this.signupForm = this._formBuilder.group({
            stepOne: this._formBuilder.group({
                owner: ['', Validators.required],
                location_name: ['', Validators.required],
                description: ['', Validators.required]
            }),
            stepTwo: this._formBuilder.group({
                email: ['', [Validators.required, Validators.email]],
                phone: ['', Validators.required],
                website: ['', Validators.required]
            }),
            stepThree: this._formBuilder.group({
                address: ['', Validators.required],
                zip: ['', Validators.required],
                school: ['', Validators.required]
            }),
            stepFour: this._formBuilder.group({
                pin: ['', Validators.required],
                password: ['', Validators.required],
                confirmPassword: ['', Validators.required]
            }, { validator: this.checkPasswords })
        });
    }

    checkPasswords(group: FormGroup) { // here we have the 'passwords' group
        let pass = group.get('password').value;
        let confirmPass = group.get('confirmPassword').value;

        return pass === confirmPass ? null : { notSame: true }
    }

    signup() {
        if (this.signupForm.invalid)
            return;

        this.isProgressVisible = true;
        this.authService.signupUser({
            ...this.signupForm.controls.stepOne.value,
            ...this.signupForm.controls.stepTwo.value,
            ...this.signupForm.controls.stepThree.value,
            ...this.signupForm.controls.stepFour.value
        }).then((result) => {
            if (result == null)
                this.router.navigate(['/profile-dashboard']);
            else if (result.isValid == false)
                this.firebaseErrorMessage = result.message;

            this.isProgressVisible = false;
        }).catch(() => {
            this.isProgressVisible = false;
        });
    }
}
