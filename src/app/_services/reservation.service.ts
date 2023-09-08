import { Reservation } from './../_models/reservation.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {

  constructor(private afs: AngularFirestore) { }

  // Get a single reservation document
  getReservationDoc(id: string) {
    return this.afs
      .collection("reservations")
      .doc(id)
      .valueChanges();
  }

  // Get a list of reservations for a specific user
  getReservationsListForUser(userId: string) {
    return this.afs
      .collection("reservations", ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }

  // Create a new reservation
  createReservation(reservation: Omit<Reservation, 'id'>): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.afs
        .collection("reservations")
        .add(reservation)
        .then((docRef) => {
          resolve(docRef.id);  // Return the auto-generated ID
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  // Delete a reservation
  deleteReservation(reservation: Reservation) {
    return this.afs
      .collection("reservations")
      .doc(reservation.id)
      .delete();
  }

  // Update a reservation
  updateReservation(reservation: Reservation) {
    return this.afs
      .collection("reservations")
      .doc(reservation.id)
      .update({
        name: reservation.name,
        phoneNumber: reservation.phoneNumber,
        totalParty: reservation.totalParty,
        time: reservation.time,
        date: reservation.date
      });
  }
}
