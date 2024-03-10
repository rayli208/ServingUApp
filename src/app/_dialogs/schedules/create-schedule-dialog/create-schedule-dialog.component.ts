import { ScheduleService } from './../../../_services/schedule.service';
import { AfterViewInit, Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Schedule } from 'src/app/_models/schedule.model';
import { Timeoff } from 'src/app/_models/timeoff.model';
import { TimeoffService } from 'src/app/_services/timeoff.service';

@Component({
  selector: 'app-create-schedule-dialog',
  templateUrl: './create-schedule-dialog.component.html',
  styleUrls: ['./create-schedule-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreateScheduleDialogComponent implements OnInit, AfterViewInit {
  constructor(
    public scheduleService: ScheduleService,
    public formBuilder: UntypedFormBuilder,
    private timeoffService: TimeoffService,
    public dialogRef: MatDialogRef<CreateScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any
  ) {
    this.employeeName = data.name; 
    this.employeeId = data.employeeId; 
    this.scheduleForm = this.formBuilder.group({
      uid: [data.uid],
      employeeId: [data.employeeId],
      startTime: ['09:00'],
      endTime: ['17:00'],
      date: [''],
      note: [''],
    });
  }
  @ViewChild('calendar') calendar: MatCalendar<Date>;
  public employeeName: string;
  public employeeId: string;
  public scheduleForm: UntypedFormGroup;
  scheduledDates: string[] = [];
  timeOffDates: string[] = [];
  daysSelected: any[] = [];
  event: any;

  ngOnInit() {
    this.loadEmployeeSchedules();
    this.loadEmployeeTimeOffs();
  }


  ngAfterViewInit() {
    this.refreshCalendarView();
  }

  loadEmployeeSchedules() {
    if (this.employeeId) {
      this.scheduleService.getSchedulesListForEmployee(this.employeeId).subscribe(res => {
        const schedules = res.map(e => {
          return {
            id: e.payload.doc.id,
            ...(e.payload.doc.data() as Schedule)
          } as Schedule;
        });
        this.scheduledDates = schedules.map(schedule => schedule.date); // Extract and store just the dates
        this.refreshCalendarView(); // Refresh the calendar to immediately reflect the scheduled dates
      }, error => {
        console.error('Error loading schedules:', error);
      });
    }
  }

  loadEmployeeTimeOffs() {
    if (this.employeeId) {
      this.timeoffService.getTimeoffListForEmployee(this.employeeId).subscribe(res => {
        const timeOffs = res.map(e => {
          return {
            id: e.payload.doc.id,
            ...(e.payload.doc.data() as Timeoff)
          } as Timeoff;
        });
        this.timeOffDates = timeOffs.map(timeOff => timeOff.date); // Extract and store just the dates
        this.refreshCalendarView(); // Refresh the calendar to immediately reflect the time-off dates
      }, error => {
        console.error('Error loading time-offs:', error);
      });
    }
  }

  refreshCalendarView() {
    if (this.calendar) {
      this.calendar.updateTodaysDate(); // Trigger a refresh of the calendar's view
    }
  }

  isSelected = (date: Date): string | null => {
    const dateString = date.toISOString().split('T')[0];
    if (this.daysSelected.includes(dateString)) {
      return 'selected'; // Your existing class for selected dates
    } else if (this.scheduledDates.includes(dateString)) {
      return 'scheduled'; // Use this class for scheduled dates
    } else if (this.timeOffDates.includes(dateString)) {
      return 'timeoff'; // A new class for time-off dates
    }
    return null;
  };

  select(event: any, calendar: any) {
    const date =
      event.getFullYear() +
      "-" +
      ("00" + (event.getMonth() + 1)).slice(-2) +
      "-" +
      ("00" + event.getDate()).slice(-2);
    const index = this.daysSelected.findIndex(x => x == date);
    if (index < 0) this.daysSelected.push(date);
    else this.daysSelected.splice(index, 1);

    calendar.updateTodaysDate();
  }

  deleteDate(date: any) {
    for (let i = 0; i < this.daysSelected.length; i++) {
      if (this.daysSelected[i] === date) {
        this.daysSelected.splice(i, 1);
      }
    }

    if (this.calendar) {
      this.calendar.updateTodaysDate();
    }
  }

  onSubmit() {
    const schedulesToSave: Schedule[] = this.daysSelected.map(date => ({
      uid: this.scheduleForm.value.uid,
      employeeId: this.scheduleForm.value.employeeId,
      startTime: this.scheduleForm.value.startTime,
      endTime: this.scheduleForm.value.endTime,
      date,
      note: this.scheduleForm.value.note
    }));

    this.scheduleService.saveBatchSchedules(schedulesToSave)
      .then(() => {
        console.log('Schedules saved successfully!');
        this.dialogRef.close({ scheduleCreated: true });
      })
      .catch(error => {
        console.error('Error saving schedules:', error);
        // Handle error case
      });
  }
}
