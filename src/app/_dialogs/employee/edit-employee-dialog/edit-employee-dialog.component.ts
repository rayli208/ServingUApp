import { Employee } from '../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { EmployeesService } from 'src/app/_services/employees.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-employee-dialog',
  templateUrl: './edit-employee-dialog.component.html',
  styleUrls: ['./edit-employee-dialog.component.scss']
})
export class EditEmployeeDialogComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  imgSrc: string;
  selectedImage: any = null;
  didChange: boolean = false;
  isSubmitted: boolean = false;

  public employee: Employee;
  public editForm: UntypedFormGroup;

  constructor(
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Employee,
    public formBuilder: UntypedFormBuilder,
    public employeesService: EmployeesService,
    public dialogRef: MatDialogRef<EditEmployeeDialogComponent>,
    private storage: AngularFireStorage,
  ) {
    this.employee = data;
    this.imgSrc = this.employee.imgUrl; // set imgSrc to the current employee's imgUrl
    this.editForm = this.formBuilder.group({ ...this.employee });
  }

  ngOnInit(): void {

  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.didChange) {
      // Delete current photo
      const imageUrl = this.editForm.controls['imgUrl'].value;
      this.storage.storage.refFromURL(imageUrl).delete().then(() => {
        var filePath = `employeeProfile/${this.selectedImage.name}_${new Date().getTime()}`;
        const fileRef = this.storage.ref(filePath);
        // Replace photo with new photo
        this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              this.editForm.get('imgUrl').setValue(url);
              this.editForm.get('name').enable();
              this.editForm.get('phone').enable();
              this.employeesService.updateEmployee(this.editForm.value, this.employee.id);
            })
          })
        ).subscribe();
      }).catch((error) => {
        console.error('Error deleting image: ', error);
      });
    } else {
      this.editForm.get('name').enable(); 
      this.editForm.get('phone').enable();
      this.employeesService.updateEmployee(this.editForm.value, this.employee.id);
      this.dialogRef.close({employeeEdited: true});
    }
  }
  
  detectNewImage($event: any) {
    this.didChange = true;
    if ($event.target.files && $event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgSrc = e.target.result;
        this.editForm.markAsDirty(); // mark the form as dirty
      }
      reader.readAsDataURL($event.target.files[0]);
      this.selectedImage = $event.target.files[0];
      this.editForm.patchValue({ fileName: $event.target.files[0].name });
    } else {
      this.selectedImage = null;
      this.editForm.patchValue({ fileName: '' });
    }
  }

  showSnackBar(message: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: ['yellow-snackbar']
    });
  }
}
