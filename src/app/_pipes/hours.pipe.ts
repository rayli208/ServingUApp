import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'convertToAMorPM'
})

export class HoursPipe implements PipeTransform {
    transform(value: string): string {

        switch (value) {
            case '00:00':
                return "12:00 AM"
            case '00:15':
                return "12:15 AM"
            case '00:30':
                return "12:30 AM"
            case '00:45':
                return "12:45 AM"
            case '01:00':
                return "01:00 AM"
            case '01:15':
                return "01:15 AM"
            case '01:30':
                return "01:30 AM"
            case '01:45':
                return "01:45 AM"
            case '02:00':
                return "02:00 AM"
            case '02:15':
                return "02:15 AM"
            case '02:30':
                return "02:30 AM"
            case '02:45':
                return "02:45 AM"
            case '02:00':
                return "02:00 AM"
            case '02:15':
                return "02:15 AM"
            case '02:30':
                return "02:30 AM"
            case '02:45':
                return "02:45 AM"
            case '03:00':
                return "03:00 AM"
            case '03:15':
                return "03:15 AM"
            case '03:30':
                return "03:30 AM"
            case '03:45':
                return "03:45 AM"
            case '04:00':
                return "04:00 AM"
            case '04:15':
                return "04:15 AM"
            case '04:30':
                return "04:30 AM"
            case '04:45':
                return "04:45 AM"
            case '05:00':
                return "05:00 AM"
            case '05:15':
                return "05:15 AM"
            case '05:30':
                return "05:30 AM"
            case '05:45':
                return "05:45 AM"
            case '06:00':
                return "06:00 AM"
            case '06:15':
                return "06:15 AM"
            case '06:30':
                return "06:30 AM"
            case '06:45':
                return "06:45 AM"
            case '07:00':
                return "07:00 AM"
            case '07:15':
                return "07:15 AM"
            case '07:30':
                return "07:30 AM"
            case '07:45':
                return "07:45 AM"
            case '08:00':
                return "08:00 AM"
            case '08:15':
                return "08:15 AM"
            case '08:30':
                return "08:30 AM"
            case '08:45':
                return "08:45 AM"
            case '09:00':
                return "09:00 AM"
            case '09:15':
                return "09:15 AM"
            case '09:30':
                return "09:30 AM"
            case '09:45':
                return "09:45 AM"
            case '10:00':
                return "10:00 AM"
            case '10:15':
                return "10:15 AM"
            case '10:30':
                return "10:30 AM"
            case '10:45':
                return "10:45 AM"
            case '11:00':
                return "11:00 AM"
            case '11:15':
                return "11:15 AM"
            case '11:30':
                return "11:30 AM"
            case '11:45':
                return "11:45 AM"
            case '12:00':
                return "12:00 PM"
            case '12:15':
                return "12:15 PM"
            case '12:30':
                return "12:30 PM"
            case '12:45':
                return "12:45 PM"
            case '13:00':
                return "01:00 PM"
            case '13:15':
                return "01:15 PM"
            case '13:30':
                return "01:30 PM"
            case '13:45':
                return "01:45 PM"
            case '14:00':
                return "02:00 PM"
            case '14:15':
                return "02:15 PM"
            case '14:30':
                return "02:30 PM"
            case '14:45':
                return "02:45 PM"
            case '15:00':
                return "03:00 PM"
            case '15:15':
                return "03:15 PM"
            case '15:30':
                return "03:30 PM"
            case '15:45':
                return "03:45 PM"
            case '16:00':
                return "04:00 PM"
            case '16:15':
                return "04:15 PM"
            case '16:30':
                return "04:30 PM"
            case '16:45':
                return "04:45 PM"
            case '17:00':
                return "05:00 PM"
            case '17:15':
                return "05:15 PM"
            case '17:30':
                return "05:30 PM"
            case '17:45':
                return "05:45 PM"
            case '18:00':
                return "06:00 PM"
            case '18:15':
                return "06:15 PM"
            case '18:30':
                return "06:30 PM"
            case '18:45':
                return "06:45 PM"
            case '19:00':
                return "07:00 PM"
            case '19:15':
                return "07:15 PM"
            case '19:30':
                return "07:30 PM"
            case '19:45':
                return "07:45 PM"
            case '20:00':
                return "08:00 PM"
            case '20:15':
                return "08:15 PM"
            case '20:30':
                return "08:30 PM"
            case '20:45':
                return "08:45 PM"
            case '21:00':
                return "09:00 PM"
            case '21:15':
                return "09:15 PM"
            case '21:30':
                return "09:30 PM"
            case '21:45':
                return "09:45 PM"
            case '22:00':
                return "10:00 PM"
            case '22:15':
                return "10:15 PM"
            case '22:30':
                return "10:30 PM"
            case '22:45':
                return "10:45 PM"
            case '23:00':
                return "11:00 PM"
            case '23:15':
                return "11:15 PM"
            case '23:30':
                return "11:30 PM"
            case '23:45':
                return "11:45 PM"
            default:
                console.log('Put in a valid time?');
        }
    }

}
