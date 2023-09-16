import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReservationsService } from 'src/app/_services/reservation.service';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Reservation } from 'src/app/_models/reservation.model';

@Component({
  selector: 'app-edit-reservations-dialog',
  templateUrl: './edit-reservations-dialog.component.html',
  styleUrls: ['./edit-reservations-dialog.component.scss']
})
export class EditReservationsDialogComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  editForm: FormGroup;
  timeOptions: string[] = this.generateTimeOptions();

  constructor(
    private _snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditReservationsDialogComponent>,
    private reservationsService: ReservationsService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editForm = this.formBuilder.group({
      name: [data.reservation.name, Validators.required],
      phoneNumber: [data.reservation.phoneNumber, Validators.required],
      totalParty: [data.reservation.totalParty, Validators.required],
      date: [data.reservation.date],
      time: [data.reservation.time, Validators.required],
      uid: [data.reservation.uid]
    });
  }

  ngOnInit() { }

  onSubmit() {
    if (this.editForm.valid) {
      const updatedReservation: Reservation = {
        id: this.data.reservation.id,
        ...this.editForm.value,
        time: this.convertTo24HourFormat(this.editForm.value.time)  // Convert time back to 24-hour format for saving
      };

      this.reservationsService.updateReservation(updatedReservation)
        .then(() => {
          this.showSnackBar("Reservation updated successfully!", "green-snackbar");
          this.dialogRef.close();
        })
        .catch(error => {
          console.error('Error updating reservation:', error);
          this.showSnackBar("Error updating reservation!", "red-snackbar");
        });
    }
  }

  formatPhoneNumber() {
    let phoneNumber = this.editForm.get('phoneNumber').value;
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
    this.editForm.patchValue({ phoneNumber: formattedPhoneNumber });
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

  // Function to convert 24-hour format to 12-hour format
  convertTo12HourFormat(time24Hour: string): string {
    const [hours, minutes] = time24Hour.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      console.error("Invalid time format received:", time24Hour);
      return '';
    }
  
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
  
}
