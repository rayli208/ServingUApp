import { EmployeesService } from '../../../_services/employees.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators'

@Component({
  selector: 'app-create-employee-dialog',
  templateUrl: './create-employee-dialog.component.html',
  styleUrls: ['./create-employee-dialog.component.scss']
})
export class CreateEmployeeDialogComponent implements OnInit {
  imgSrc: string = '../../../../assets/img/placeholder.png';
  selectedImage: any = null;
  isSubmitted: boolean = false;
  public employeeForm: FormGroup;

  constructor(
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    public employeesService: EmployeesService,
    public formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateEmployeeDialogComponent>,

  ) {
    this.employeeForm = this.formBuilder.group({
      uid: [''],
      name: [''],
      position: [''],
      hours: [''],
      phone: [''],
      email: [''],
      imgUrl: [''],
      employeed: true
    })
  }

  //Set ID of owner of job on load
  ngOnInit() {
    this.setUserId();
  }

  path: string;
  pathName: string;


  //Create job and redirect to dashboard
  onSubmit() {
    this.isSubmitted = true;
    var filePath = `employeeProfile/${this.selectedImage.name}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe((url) => {
          this.employeeForm.get('imgUrl').setValue(url);
          this.employeesService.createEmployee(this.employeeForm.value);
          this.dialogRef.close();
        })
      })
    ).subscribe();
  }

  //Set User ID so jobs have link to their owners
  setUserId() {
    this.afAuth.authState.subscribe(async user => {
      if (user && user.uid) {
        this.employeeForm.patchValue({
          uid: user.uid,
        });
      }
    });
  }

  detectNewImage($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL($event.target.files[0]);
      this.selectedImage = $event.target.files[0];
    } else {
      this.imgSrc = '../../../../assets/img/placeholder.png';
      this.selectedImage = null;
    }
  }
}