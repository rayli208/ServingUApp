import { EmployeesService } from '../../../_services/employees.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators'
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarHorizontalPosition as MatSnackBarHorizontalPosition, MatLegacySnackBarVerticalPosition as MatSnackBarVerticalPosition } from '@angular/material/legacy-snack-bar';

const DEFAULT_IMG_SRC = '../../../../assets/img/placeholder.png';

@Component({
  selector: 'app-create-employee-dialog',
  templateUrl: './create-employee-dialog.component.html',
  styleUrls: ['./create-employee-dialog.component.scss']
})
export class CreateEmployeeDialogComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  imgSrc: string = DEFAULT_IMG_SRC;
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
      uid: new FormControl(''),
      name: new FormControl(''),
      position: new FormControl(''),
      employmentType: new FormControl(''),
      phone: new FormControl(''),
      email: new FormControl(''),
      imgUrl: new FormControl(''),
      employeed: new FormControl(true),
      clockedIn: new FormControl(false),
      clockedInTime: new FormControl(null),
      fileName: new FormControl(''),
    })
  }

  ngOnInit() {
    this.setUserId();
  }

  async onSubmit() {
    this.isSubmitted = true;
    if (!this.selectedImage) {
      // Handle the case where no file is selected.
      this.showSnackBar("No image selected!", 'red-snackbar');
      this.isSubmitted = false;
      return;
    }
    var filePath = `employeeProfile/${this.selectedImage.name}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);
    this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(async () => {
        const url = await fileRef.getDownloadURL().toPromise();
        this.employeeForm.get('imgUrl').setValue(url);
        this.employeesService.createEmployee(this.employeeForm.value);
        this.isSubmitted = false;
        this.showSnackBar("Employee has been created!", 'green-snackbar');
        this.dialogRef.close();
      })
    ).subscribe();
  }


  setUserId() {
    this.afAuth.authState.subscribe(user => {
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
      this.employeeForm.patchValue({ fileName: $event.target.files[0].name });
    } else {
      this.imgSrc = DEFAULT_IMG_SRC;
      this.selectedImage = null;
      this.employeeForm.patchValue({ fileName: '' });
    }
  }

  showSnackBar(message: string, color: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: [color]
    });
  }
}