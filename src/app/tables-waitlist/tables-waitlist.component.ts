import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reservation } from '../_models/reservation.model';
import { Message } from '../_models/message.model';
import { MessagesService } from '../_services/messages.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { ReservationsService } from '../_services/reservation.service';

@Component({
  selector: 'app-tables-waitlist',
  templateUrl: './tables-waitlist.component.html',
  styleUrls: ['./tables-waitlist.component.scss']
})
export class TablesWaitlistComponent implements OnInit {
  user: Observable<any>;
  userId: string;
  currentEmployeer: any;
  reservations: Reservation[] = [];
  message: string;

  public reservationForm: FormGroup;
  timeOptions: string[] = this.generateTimeOptions();

  constructor(
    public messagesService: MessagesService,
    private _snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private reservationsService: ReservationsService
  ) {
    this.user = null;
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
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        let emailLower = user.email.toLowerCase();
        this.authService.getCurrentUserInfo(emailLower).subscribe(res => {
          this.currentEmployeer = res;
          this.message = `Your table is now ready at ${this.currentEmployeer.location_name}.\n\nPlease come to the host stand to be seated!`;
        });

        this.setUserId();
        this.fetchReservations();
      }
    });
  }

  setUserId() {
    this.reservationForm.patchValue({
      uid: this.userId,
    });
  }

  fetchReservations() {
    const todayDate = new Date().toISOString().split('T')[0];
    this.reservationsService.getReservationsListForUser(this.userId).subscribe(reservations => {
      this.reservations = reservations.map(e => {
        return {
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Omit<Reservation, 'id'>) // Asserting the type here
        } as Reservation;
      }).filter(reservation => reservation.date === todayDate).sort((a, b) => {
        return new Date(`1970-01-01 ${a.time}`).getTime() - new Date(`1970-01-01 ${b.time}`).getTime();
      });
    });
  }

  onSubmit() {
    if (this.reservationForm.valid) {
      const selectedTime = this.reservationForm.get('time').value;
      const formattedTime24Hour = this.convertTo24HourFormat(selectedTime);
      this.reservationForm.patchValue({ time: formattedTime24Hour });

      this.reservationsService.createReservation(this.reservationForm.value)
        .then(id => {
          this.showSnackBar("Reservation added successfully!", "green-snackbar");
          this.fetchReservations();
        })
        .catch(error => {
          console.error('Error adding reservation:', error);
          this.showSnackBar("Error adding reservation!", "red-snackbar");
        });
    }
  }

  deleteReservation(reservation: Reservation) {
    this.reservationsService.deleteReservation(reservation)
      .then(() => {
        this.fetchReservations();
      })
      .catch(error => {
        console.error("Error deleting reservation:", error);
      });
  }

  textTableReady(reservation: Reservation) {
    reservation.hasRecievedText = true;
    this.sendMessageToReservation(reservation, this.message);
  }

  sendMessageToReservation(reservation: Reservation, messageContent: string) {
    const phoneNumber = '1' + reservation.phoneNumber.replace(/-/g, "");
    const message: Message = {
      channelId: 'a31f78766da04f9e95ce52a85cf13bdd',
      to: phoneNumber,
      type: 'text',
      content: { text: messageContent }
    };

    this.messagesService.createMessage(message);
    let totalMessagesCount = Math.ceil(messageContent.length / 153);
    this.authService.updateTextsThisMonth(totalMessagesCount)
      .then(() => {
        this._snackBar.open('Text has been sent!', '', {
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      })
      .catch(error => {
        console.log('Error updating textsThisMonth:', error);
      });
  }

  formatPhoneNumber() {
    let formattedPhoneNumber = '';
    let currentCharCount = 0;
    const phoneNumber = this.reservationForm.get('phoneNumber').value;
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

  formatTo12Hour(time24Hour: string): string {
    const [hours, minutes] = time24Hour.split(':').map(Number);
    let period = 'AM';
    let formattedHours = hours;

    if (hours >= 12) {
      period = 'PM';
    }

    if (hours === 0) {
      formattedHours = 12;
    } else if (hours > 12) {
      formattedHours -= 12;
    }

    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
