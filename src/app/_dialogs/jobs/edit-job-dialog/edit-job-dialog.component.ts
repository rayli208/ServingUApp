import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Job } from 'src/app/_models/job.model';
import { JobsService } from 'src/app/_services/jobs.service';
import svgsData from '../../../core/constants/svg';

@Component({
  selector: 'app-edit-job-dialog',
  templateUrl: './edit-job-dialog.component.html',
  styleUrls: ['./edit-job-dialog.component.scss']
})
export class EditJobDialogComponent implements OnInit {
  public job: Job;
  public editForm: UntypedFormGroup;
  public svgs = svgsData;  // Add this line

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Job,
    public formBuilder: UntypedFormBuilder,
    public jobsService:JobsService,
    public dialogRef: MatDialogRef<EditJobDialogComponent>,
    ) { 
    this.job = data;

    this.editForm = this.formBuilder.group({...this.job})
  }

  ngOnInit(): void {}

  onSvgSelected(pathD: string) {
    this.editForm.get('icon').setValue(pathD);
    this.editForm.markAsDirty();
}

  onSubmit(){
    this.jobsService.updateJob(this.editForm.value, this.job.id);
    this.dialogRef.close({jobEdited: true});
  }
}
