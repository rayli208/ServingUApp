import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Message } from '../_models/message.model';

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    constructor(private afs: AngularFirestore,
    ) { }

    createMessage(message: Message) {
        return new Promise<any>((resolve, reject) => {
            this.afs
                .collection("messages")
                .add(message)
                .then(() => {
                    console.log("Message has been sent!"),
                        error => {
                            console.log("'Please contact IT for further assistance.', 'There has been an error creating the Employee.")
                            return reject(error);
                        }
                });
        });
    }
}
