import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscriber } from '../_models/subscriber.model';

@Injectable({
  providedIn: 'root'
})
export class SubscribersService {
  constructor(
    private afs: AngularFirestore,
  ) { }

  // Get a specific subscriber by their ID
  getSubscriberDoc(id: string) {
    return this.afs
      .collection('subscribers')
      .doc(id)
      .valueChanges();
  }

  // Get all subscribers belonging to a specific user by UID
  getSubscribersListForUser(userId: string) {
    return this.afs
      .collection('subscribers', ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }

  // Add a new subscriber
  createSubscriber(subscriber: Subscriber) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection('subscribers')
        .add(subscriber)
        .then(resolve, reject);
    });
  }

  // Delete a specific subscriber by their document ID
  deleteSubscriber(subscriberId: string) {
    return this.afs
      .collection('subscribers')
      .doc(subscriberId)
      .delete();
  }

  // Delete multiple subscribers using their IDs
  deleteMultipleSubscribers(subscriberIds: string[]) {
    const batch = this.afs.firestore.batch();
    subscriberIds.forEach(id => {
      const docRef = this.afs.collection('subscribers').doc(id).ref;
      batch.delete(docRef);
    });
    return batch.commit();
  }

  // Update specific fields of a subscriber by their ID
  updateSubscriber(subscriberId: string, updatedData: Partial<Subscriber>) {
    return this.afs
      .collection('subscribers')
      .doc(subscriberId)
      .update(updatedData);
  }
}
