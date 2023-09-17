import { Component, OnInit } from '@angular/core';
import { ReservationsService } from '../_services/reservation.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateReservationsDialogComponent } from '../_dialogs/reservations/create-reservations-dialog/create-reservations-dialog.component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Reservation } from '../_models/reservation.model';
import { DateAdapter } from '@angular/material/core';
import { EditReservationsDialogComponent } from '../_dialogs/reservations/edit-reservations-dialog/edit-reservations-dialog.component';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reservations-dashboard',
  templateUrl: './reservations-dashboard.component.html',
  styleUrls: ['./reservations-dashboard.component.scss']
})
export class ReservationsDashboardComponent implements OnInit {
  userId: string;
  selectedDate: string = null;
  allReservations: Reservation[] = [];
  reservationsForSelectedDate: Reservation[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private reservationsService: ReservationsService,
    private dialog: MatDialog,
    private afAuth: AngularFireAuth,
    private _snackBar: MatSnackBar,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-US');
    const now = new Date();
    this.selectedDate = this.dateAdapter.format(now, 'YYYY-MM-DD');
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.fetchAllReservations();
      }
    });
  }

  fetchAllReservations(): void {
    this.reservationsService.getReservationsListForUser(this.userId).subscribe(snapshot => {
      this.allReservations = snapshot.map(e => {
        const data = e.payload.doc.data() as Omit<Reservation, 'id'>;
        return {
          id: e.payload.doc.id,
          ...data,
          time: this.convertTo12HourFormat(data.time)
        } as Reservation;
      });

      this.filterReservationsForSelectedDate();
    });
  }

  filterReservationsForSelectedDate(): void {
    const formattedSelectedDate = new Date(this.selectedDate).toISOString().split('T')[0];
    this.reservationsForSelectedDate = this.allReservations
      .filter(reservation => reservation.date === formattedSelectedDate)
      .sort((a, b) => {
        const minutesA = this.timeToMinutes(a.time);
        const minutesB = this.timeToMinutes(b.time);

        // Compare the times in minutes
        if (minutesA < minutesB) return -1;
        if (minutesA > minutesB) return 1;

        // If times are the same, compare the names
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;

        // If both time and name are the same, return 0 (no change in order)
        return 0;
      });
  }

  // Helper method to convert time string (HH:MM AM/PM) to minutes since midnight
  timeToMinutes(timeStr: string): number {
    const [hours, minutesPart] = timeStr.split(':');
    const minutes = parseInt(minutesPart);
    const hoursInt = parseInt(hours);
    // Convert PM hours to 24-hour format. Note: 12:00 PM - 12:59 PM remains the same.
    const totalMinutes = (timeStr.includes('PM') && hoursInt !== 12 ? hoursInt + 12 : hoursInt) * 60 + minutes;
    // Convert AM 12:xx to 0:xx
    return timeStr.includes('AM') && hoursInt === 12 ? minutes : totalMinutes;
  }


  openCreateReservationDialog(): void {
    const dialogRef = this.dialog.open(CreateReservationsDialogComponent, {
      width: '500px',
      data: { allReservations: this.allReservations }  // Passing all reservations as data
    });

    dialogRef.afterClosed().subscribe(result => {
      this.fetchAllReservations();
    });
  }

  openEditReservationDialog(reservation: Reservation): void {
    const dialogRef = this.dialog.open(EditReservationsDialogComponent, {
      width: '500px',
      data: { 
        reservation: reservation,
        allReservations: this.allReservations,  // Passing all reservations as data
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.fetchAllReservations();
    });
  }
  

  removeReservation(reservation: Reservation) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete the reservation for ${reservation.name}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reservationsService.deleteReservation(reservation).then(() => {
          this._snackBar.open('Reservation has been deleted!', '', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 2500,
            panelClass: ['red-snackbar']
          });
          // Refresh the reservations after deletion
          this.fetchAllReservations();
        }).catch(error => {
          console.error('Error deleting reservation:', error);
          this._snackBar.open('Error deleting reservation!', '', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
      }
    });
  }

  convertTo12HourFormat(time24Hour: string): string {
    const [hours, minutes] = time24Hour.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
  }
}
