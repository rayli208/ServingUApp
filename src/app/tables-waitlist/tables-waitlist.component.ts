import { Component, OnInit } from '@angular/core';
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
  name: string;
  phoneNumber: string;
  estimatedWait: number;
  totalParty: number;
  reservations: Reservation[] = [];
  message: string;

  constructor(
    public messagesService: MessagesService,
    private _snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private reservationsService: ReservationsService
  ) {
    this.user = null;
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

        // Fetch reservations for today
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
    });
  }

  addReservation() {
    if (this.name && this.phoneNumber && this.estimatedWait) {
      const todayDate = new Date().toISOString().split('T')[0];
      const reservationTime = this.calculateTime(this.estimatedWait).toString();

      const reservation: Omit<Reservation, 'id'> = {
        uid: this.userId,
        name: this.name,
        phoneNumber: this.phoneNumber,
        totalParty: this.totalParty,
        time: reservationTime,
        date: todayDate
      };

      // Add the reservation to Firestore
      this.reservationsService.createReservation(reservation).then(id => {
        // Once the reservation is successfully created, get the auto-generated ID and update the local array
        const fullReservation: Reservation = { ...reservation, id };

        // Update reservations array and sort
        this.reservations.push(fullReservation);
        this.reservations.sort((a, b) => {
          return new Date(`1970-01-01 ${a.time}`).getTime() - new Date(`1970-01-01 ${b.time}`).getTime();
        });

        this.name = '';
        this.phoneNumber = '';
        this.estimatedWait = null;
        this.totalParty = null;
      }).catch(error => {
        console.error("Error creating reservation:", error);
      });
    }
  }

  deleteReservation(reservation: Reservation) {
    this.reservationsService.deleteReservation(reservation).then(() => {
      const index = this.reservations.indexOf(reservation);
      if (index !== -1) {
        this.reservations.splice(index, 1);
      }
      // Sort reservations after deletion to ensure order
      this.reservations.sort((a, b) => {
        return new Date(`1970-01-01 ${a.time}`).getTime() - new Date(`1970-01-01 ${b.time}`).getTime();
      });
    }).catch(error => {
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
      content: {
        text: messageContent
      }
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
    for (let i = 0; i < this.phoneNumber.length; i++) {
      const currentChar = this.phoneNumber[i];
      if (/^\d+$/.test(currentChar)) {
        if (currentCharCount === 3 || currentCharCount === 6) {
          formattedPhoneNumber += '-';
        }
        formattedPhoneNumber += currentChar;
        currentCharCount++;
      }
    }
    this.phoneNumber = formattedPhoneNumber;
  }

  calculateTime(minutes: number): string {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + minutes);
    return currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
}
