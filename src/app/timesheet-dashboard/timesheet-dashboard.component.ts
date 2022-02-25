import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-timesheet-dashboard',
  templateUrl: './timesheet-dashboard.component.html',
  styleUrls: ['./timesheet-dashboard.component.css']
})
export class TimesheetDashboardComponent implements OnInit {
  daysOfWeek: Date[] = [];
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor() { }

  ngOnInit(): void {
    this.getDaysOfWeek();
  }

  getDaysOfWeek() {
    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay() + 1;
    var firstDay = new Date(curr.setDate(first));
    var currentDate = firstDay;
    this.daysOfWeek.push(currentDate);

    for (var i = 0; i < 13; i++) {
      currentDate = this.addDays(currentDate, 1);
      this.daysOfWeek.push(currentDate);
    }
    console.log(this.daysOfWeek);
  }

  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  onPrint() {
    this.accordion.openAll();
    setTimeout(() => {
      window.print();
    }, 1500);

  }
}
