import { Component, OnInit } from '@angular/core';
import { Contact } from '../_models/contact.model';
import { trigger, style, animate, transition, group, query, animateChild } from '@angular/animations';

@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss'],
  animations: [
    trigger('myAnimationTrigger', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 })),
      ]),
      transition('* => *', [
        group([
          query(':enter', [
            style({ transform: 'translateY(-100%)' }),
            animateChild()
          ]),
          query(':leave', [
            animateChild()
          ])
        ]),
        query(':enter', [
          animate('500ms ease-out', style({ transform: 'translateY(0)' }))
        ])
      ])
    ]),
  ],
})

export class WaitlistComponent implements OnInit {
  name: string;
  phoneNumber: string;
  waitTime: number;
  totalParty: number;
  reservationMade: string;
  estimatedTime: string;
  contacts: Contact[] = [];

  ngOnInit() {
    const storedContacts = localStorage.getItem('contacts');
    if (storedContacts) {
      this.contacts = JSON.parse(storedContacts);
    }
  }

  addContact() {
    if (this.name && this.phoneNumber && this.waitTime) {
      const contact = {
        name: this.name,
        phoneNumber: this.phoneNumber,
        waitTime: this.waitTime,
        totalParty: this.totalParty,
        reservationMade: this.calculateTime(0).toString(),
        estimatedTime: this.calculateTime(this.waitTime).toString()
      };
      this.contacts.push(contact);
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
      this.name = '';
      this.phoneNumber = '';
      this.waitTime = null;
      this.totalParty = null;
      this.reservationMade = '';
      this.estimatedTime = '';
    }
  }

  deleteContact(contact: Contact) {
    // Find the index of the contact in the array
    const index = this.contacts.indexOf(contact);
    // Remove the contact from the array
    this.contacts.splice(index, 1);
    // Update local storage
    localStorage.setItem('contacts', JSON.stringify(this.contacts));
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

  // This function takes in a number of minutes and returns the current time plus that number of minutes
  // as a string in the "HH:MM AM/PM" format
  calculateTime(min: number): string {
    // Get the current date and time
    const currentTime = new Date();
    // Add the number of minutes to the current time
    currentTime.setMinutes(currentTime.getMinutes() + min);

    // Extract the hours, minutes, and AM/PM suffix from the current time
    let hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert the hours to a 12-hour format
    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    // Format the time as a string in the "HH:MM AM/PM" format
    const timeString = `${hours}:${minutes} ${ampm}`;
    return timeString;
  }
}
