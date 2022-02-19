import { Router } from '@angular/router';
import { JobsService } from '../_services/jobs.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.scss']
})
export class CreateJobComponent implements OnInit {
  public jobForm: FormGroup;
  
  constructor(
    public jobsService: JobsService,
    public formBuilder: FormBuilder,
    public router: Router,
    private afAuth: AngularFireAuth,
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
    this.jobsService.createJob(this.jobForm.value);
    this.router.navigate(['hiring-dashboard']);
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
