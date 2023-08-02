import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appPhoneNumberFormat]'
})
export class PhoneNumberFormatDirective {

  private phoneNumber: string;

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    this.phoneNumber = value.replace(/\D/g, '').substring(0, 10);
    this.el.nativeElement.value = this.formatPhoneNumber(this.phoneNumber);
  }

  private formatPhoneNumber(phoneNumber: string) {
    const phone = phoneNumber.match(/^(\d{3})(\d{3})(\d{4})$/);
    return phone ? `${phone[1]}-${phone[2]}-${phone[3]}` : phoneNumber;
  }
}