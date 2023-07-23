import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JobsService } from 'src/app/_services/jobs.service';
import svgsData from '../../../core/constants/svg';

@Component({
  selector: 'app-create-job-dialog',
  templateUrl: './create-job-dialog.component.html',
  styleUrls: ['./create-job-dialog.component.scss']
})
export class CreateJobDialogComponent implements OnInit {
  public jobForm: UntypedFormGroup;

  // Define a property for the svgs
  public svgs = svgsData;

  constructor(
    public jobsService: JobsService,
    public formBuilder: UntypedFormBuilder,
    public router: Router,
    private afAuth: AngularFireAuth,
    public dialogRef: MatDialogRef<CreateJobDialogComponent>,
  ) {
    this.jobForm = this.formBuilder.group({
      uid: [''],
      title: [''],
      icon: [''],
      description: [''],
      totalPositions: 0,
      employmentType: [''],
    })
  }

  //Set ID of owner of job on load
  ngOnInit() {
    this.setUserId();
  }

  //Create job and redirect to dashboard
  onSubmit() {
    this.jobsService.createJob(this.jobForm.value);
    this.dialogRef.close({jobCreated: true});
  }

  //Set User ID so jobs have link to their owners
  setUserId() {
    this.afAuth.authState.subscribe(async user => {
      if (user && user.uid) {
        this.jobForm.patchValue({
          uid: user.uid,
        });
      }
    });
  }

  onSvgSelected(svg: any) {
    this.jobForm.get('icon').setValue(svg);
  }
}
