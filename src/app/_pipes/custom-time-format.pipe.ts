import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customTimeFormat'
})
export class CustomTimeFormatPipe implements PipeTransform {

  transform(value: Date): string {
    let hours = value.getHours();
    let minutes = value.getMinutes();
    let hoursStr = hours < 10 ? '0' + hours : hours.toString();
    let minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
    let formattedTime = '';
    if (hours < 12) {
      formattedTime = hoursStr + ':' + minutesStr + ' AM';
    } else {
      hours = hours - 12;
      hoursStr = hours < 10 ? '0' + hours : hours.toString();
      formattedTime = hoursStr + ':' + minutesStr + ' PM';
    }
    return formattedTime;
  }

}
