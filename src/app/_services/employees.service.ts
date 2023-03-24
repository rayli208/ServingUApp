import { Employee } from './../_models/employee.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(private afs: AngularFirestore,
    private _snackBar: MatSnackBar
  ) { }

  getEmployeeDoc(id) {
    return this.afs
      .collection("employees")
      .doc(id)
      .valueChanges();
  }

  getEmployeesListForUser(userId) {
    return this.afs
      .collection("employees", ref => ref.where('uid', '==', userId))
      .snapshotChanges();
  }

  createEmployee(employee: Employee) {
    return new Promise<any>((resolve, reject) => {
      this.afs
        .collection("employees")
        .add(employee)
        .then(() => {
          this._snackBar.open('Employee has been created!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          })
            , error => {
              console.log("'Please contact IT for further assistance.', 'There has been an error creating the Employee.")
              return reject(error);
            }
        });
    });
  }

  deleteEmployee(employee: Employee) {
    return this.afs
      .collection("employees")
      .doc(employee.id)
      .delete()
      .then(() => {
        this._snackBar.open('Employee has been deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
  }

  updateEmployee(employee: Employee, id) {
    return this.afs
      .collection("employees")
      .doc(id)
      .update({
        name: employee.name,
        position: employee.position,
        employmentType: employee.employmentType,
        phone: employee.phone,
        email: employee.email,
        color: employee.color,
        imgUrl: employee.imgUrl,
        employeed: employee.employeed,
        clockedIn: employee.clockedIn
      }).then(() => {
        this._snackBar.open('Employee has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      });
  }
}
