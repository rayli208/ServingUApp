import { EmployeesService } from '../../../_services/employees.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialogRef } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators'
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-create-employee-dialog',
  templateUrl: './create-employee-dialog.component.html',
  styleUrls: ['./create-employee-dialog.component.scss']
})
export class CreateEmployeeDialogComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  imgSrc: string = '../../../../assets/img/placeholder.png';
  selectedImage: any = null;
  isSubmitted: boolean = false;
  public employeeForm: UntypedFormGroup;

  constructor(
    private _snackBar: MatSnackBar,
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    public employeesService: EmployeesService,
    public formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<CreateEmployeeDialogComponent>,

  ) {
    this.employeeForm = this.formBuilder.group({
      uid: [''],
      name: [''],
      position: [''],
      employmentType: [''],
      phone: [''],
      email: [''],
      imgUrl: [''],
      employeed: true,
      clockedIn: false,
      clockedInTime: null
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
          this.isSubmitted = false;
          this.showSnackBar("Employee has been created!");
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

  showSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: ['green-snackbar']
    });
  }
}