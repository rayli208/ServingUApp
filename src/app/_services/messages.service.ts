import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Message } from '../_models/message.model';

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    constructor(private afs: AngularFirestore) { }

    createMessage(message: Message) {
        return new Promise<any>((resolve, reject) => {
            this.afs
                .collection("messages")
                .add(message)
                .then(response => {
                    // If the message is added successfully, resolve the promise.
                    console.log('Message created successfully:', response);
                    resolve(response);
                })
                .catch(error => {
                    // If there's an error adding the message, reject the promise.
                    console.error('Error creating message:', error);
                    reject(error);
                });
        });
    }
}
