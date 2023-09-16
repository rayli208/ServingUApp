import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ReservationsService } from 'src/app/_services/reservation.service';

@Component({
  selector: 'app-create-reservations-dialog',
  templateUrl: './create-reservations-dialog.component.html',
  styleUrls: ['./create-reservations-dialog.component.scss']
})
export class CreateReservationsDialogComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  public reservationForm: FormGroup;
  timeOptions: string[] = this.generateTimeOptions();

  constructor(
    private _snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateReservationsDialogComponent>,
    private reservationsService: ReservationsService
  ) {
    const today = new Date().toISOString().split('T')[0];

    this.reservationForm = this.formBuilder.group({
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      totalParty: ['', Validators.required],
      date: [today],
      time: ['', Validators.required],
      uid: ['']  // Will be auto-populated
    });
  }

  ngOnInit() {
    this.setUserId();
  }

  setUserId() {
    this.afAuth.authState.subscribe(user => {
      if (user && user.uid) {
        this.reservationForm.patchValue({
          uid: user.uid,
        });
      }
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      // Convert time to 24-hour format before saving
      const selectedTime = this.reservationForm.get('time').value;
      const formattedTime24Hour = this.convertTo24HourFormat(selectedTime);
      this.reservationForm.patchValue({ time: formattedTime24Hour });
      
      this.reservationsService.createReservation(this.reservationForm.value)
        .then(id => {
          this.showSnackBar("Reservation created successfully!", "green-snackbar");
          this.dialogRef.close();
        })
        .catch(error => {
          console.error('Error creating reservation:', error);
          this.showSnackBar("Error creating reservation!", "red-snackbar");
        });
    }
  }

  formatPhoneNumber() {
    let phoneNumber = this.reservationForm.get('phoneNumber').value;
    let formattedPhoneNumber = '';
    let currentCharCount = 0;
    for (let i = 0; i < phoneNumber.length; i++) {
      const currentChar = phoneNumber[i];
      if (/^\d+$/.test(currentChar)) {
        if (currentCharCount === 3 || currentCharCount === 6) {
          formattedPhoneNumber += '-';
        }
        formattedPhoneNumber += currentChar;
        currentCharCount++;
      }
    }
    this.reservationForm.patchValue({ phoneNumber: formattedPhoneNumber });
  }

  generateTimeOptions(): string[] {
    const times: string[] = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        let hours = i;
        let minutes = j;
        let period = 'AM';

        if (hours >= 12) {
          period = 'PM';
        }

        if (hours === 0) {
          hours = 12;
        } else if (hours > 12) {
          hours -= 12;
        }

        const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
        times.push(formattedTime);
      }
    }
    return times;
  }

  showSnackBar(message: string, color: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: [color]
    });
  }

  convertTo24HourFormat(time12Hour: string): string {
    const period = time12Hour.slice(-2);
    let [hours, minutes] = time12Hour.slice(0, -3).split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
