import { JobsService } from '../_services/jobs.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.scss']
})
export class EditJobComponent implements OnInit {
  public editForm: FormGroup;
  jobRef: any;

  constructor(
    public jobService: JobsService,
    public formBuilder: FormBuilder,
    public act: ActivatedRoute,
    public router: Router
  ) {
    this.editForm = this.formBuilder.group({
      title: [''],
      location: [''],
      description: [''],
      school: [''],
      hours: [''],
      phone: [''],
      email: [''],
    })
  }


  ngOnInit(): void {
    const id = this.act.snapshot.paramMap.get('id');

    this.jobService.getJobDoc(id).subscribe(res => {
      this.jobRef = res;
      this.editForm = this.formBuilder.group({
        title: this.jobRef.title,
        location: this.jobRef.location,
        description: this.jobRef.description,
        school: this.jobRef.school,
        hours: this.jobRef.hours,
        phone: this.jobRef.phone,
        email: this.jobRef.email,
        website: this.jobRef.website,
        hired: false,
      })
    })
  }

  onSubmit(){
    const id = this.act.snapshot.paramMap.get('id');

    console.log(this.editForm.value);

    this.jobService.updateJob(this.editForm.value, id);
    this.router.navigate(['dashboard']);
  }
}
