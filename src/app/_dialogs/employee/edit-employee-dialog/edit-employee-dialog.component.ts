import { Employee } from '../../../_models/employee.model';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EmployeesService } from 'src/app/_services/employees.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators'

@Component({
  selector: 'app-edit-employee-dialog',
  templateUrl: './edit-employee-dialog.component.html',
  styleUrls: ['./edit-employee-dialog.component.css']
})
export class EditEmployeeDialogComponent implements OnInit {
  imgSrc: string;
  selectedImage: any = null;
  didChange: boolean = false;

  public employee: Employee;
  public editForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Employee,
    public formBuilder: FormBuilder,
    public employeesService: EmployeesService,
    public dialogRef: MatDialogRef<EditEmployeeDialogComponent>,
    private storage: AngularFireStorage,
  ) {
    this.employee = data;
    this.editForm = this.formBuilder.group({ ...this.employee });
    this.imgSrc = this.employee.imgUrl;
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.didChange) {
      //Delete current photo
      this.storage.storage.refFromURL(this.editForm.value.imgUrl).delete();
      var filePath = `employeeProfile/${this.selectedImage.name}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      //Replace photo with new photo
      this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.editForm.get('imgUrl').setValue(url);
            this.employeesService.updateEmployee(this.editForm.value, this.employee.id);
            this.dialogRef.close();
          })
        })
      ).subscribe();
    } else {
      this.employeesService.updateEmployee(this.editForm.value, this.employee.id);
      this.dialogRef.close();
    }
  }

  detectNewImage($event: any) {
    this.didChange = true;
    if ($event.target.files && $event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL($event.target.files[0]);
      this.selectedImage = $event.target.files[0];
    }
  }
}
