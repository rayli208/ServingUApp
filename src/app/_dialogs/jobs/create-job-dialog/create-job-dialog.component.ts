import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JobsService } from 'src/app/_services/jobs.service';

@Component({
  selector: 'app-create-job-dialog',
  templateUrl: './create-job-dialog.component.html',
  styleUrls: ['./create-job-dialog.component.css']
})
export class CreateJobDialogComponent implements OnInit {
  public jobForm: FormGroup;
  
  constructor(
    public jobsService: JobsService,
    public formBuilder: FormBuilder,
    public router: Router,
    private afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<CreateJobDialogComponent>,
  ) {
    this.jobForm = this.formBuilder.group({
      uid: [''],
      title: [''],
      location: [''],
      description: [''],
      hours: [''],
      phone: [''],
      email: [''],
      hired: false
    })
  }

  //Set ID of owner of job on load
  ngOnInit() {
    this.setUserId();
  }
  
  //Create job and redirect to dashboard
  onSubmit() {
    console.log(this.jobForm.value);
    this.jobsService.createJob(this.jobForm.value);
    this.dialogRef.close();
  }

  //Set User ID so jobs have link to their owners
  setUserId(){
    this.afAuth.authState.subscribe(async user => {
      if (user && user.uid) {
        this.jobForm.patchValue({
          uid: user.uid,
        });
      }
    });
  }

}
