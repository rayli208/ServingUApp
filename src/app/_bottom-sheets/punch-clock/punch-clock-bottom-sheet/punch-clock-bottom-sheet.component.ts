import { Employee } from './../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-punch-clock-bottom-sheet',
  templateUrl: './punch-clock-bottom-sheet.component.html',
  styleUrls: ['./punch-clock-bottom-sheet.component.scss']
})
export class PunchClockBottomSheetComponent implements OnInit {

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: Employee
  ) {

  }

  ngOnInit(): void {
  }

}
