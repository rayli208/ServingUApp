import { Component, OnInit } from '@angular/core';
import { Contact } from '../_models/contact.model';

@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss']
})
export class WaitlistComponent implements OnInit {
  name: string;
  phoneNumber: string;
  waitTime: number;
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
        waitTime: this.waitTime
      };
      this.contacts.push(contact);
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
      this.name = '';
      this.phoneNumber = '';
      this.waitTime = null;
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
}
