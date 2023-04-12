import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TablesService } from 'src/app/_services/tables.service';

@Component({
  selector: 'app-create-table-dialog',
  templateUrl: './create-table-dialog.component.html',
  styleUrls: ['./create-table-dialog.component.scss']
})
export class CreateTableDialogComponent implements OnInit {
  public tableForm: UntypedFormGroup;
  
  constructor(
    public tablesService: TablesService,
    public formBuilder: UntypedFormBuilder,
    public router: Router,
    private afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<CreateTableDialogComponent>,
  ) {
    this.tableForm = this.formBuilder.group({
      uid: [''],
      tableNumber: [],
      shape: [''],
      color: [''],
      seats: [],
      floorPlan: [],
      isActive: false,
      positionX: 0,
      positionY: 0
    })
  }

  //Set ID of owner of job on load
  ngOnInit() {
    this.setUserId();
  }
  
  //Create job and redirect to dashboard
  onSubmit() {
    this.tablesService.createTable(this.tableForm.value);
    this.dialogRef.close();
  }

  //Set User ID so jobs have link to their owners
  setUserId(){
    this.afAuth.authState.subscribe(async user => {
      if (user && user.uid) {
        this.tableForm.patchValue({
          uid: user.uid,
        });
      }
    });
  }

}
