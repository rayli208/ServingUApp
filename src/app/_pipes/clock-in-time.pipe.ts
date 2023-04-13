import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'clockInTime'
})
export class ClockInTimePipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }
    const [hours, minutes] = value.split(':');
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  }

}
