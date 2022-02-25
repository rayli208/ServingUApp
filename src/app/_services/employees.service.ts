import { Employee } from './../_models/employee.model';
import { NotificationService } from './notification.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor(private afs: AngularFirestore,
    private toastr: NotificationService
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
          this.toastr.showSuccess('', 'Employee has been created!')
        , error => {
          this.toastr.showError('Please contact IT for further assistance.', 'There has been an error creating the Employee.')
          return reject(error);
        } });
    });
  }

  deleteEmployee(employee: Employee) {
    this.toastr.showWarning('','Employee has been deleted.');
    return this.afs
      .collection("employees")
      .doc(employee.id).
      delete();
  }

  updateEmployee(employee: Employee, id) {
    this.toastr.showInfo('','Employee has been edited.')
    return this.afs
      .collection("employees")
      .doc(id)
      .update({
        name: employee.name,
        position: employee.position,
        hours: employee.hours,
        phone: employee.phone,
        email: employee.email,
        imgUrl: employee.imgUrl,
        employeed: employee.employeed
      })
  }
}
