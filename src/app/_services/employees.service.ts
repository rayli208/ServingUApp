import { Employee } from './../_models/employee.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EmployeesService {

  constructor(private afs: AngularFirestore) { }

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
        .then(() => { })
        .catch(error => {
          return reject(error);
        });
    });
  }

  deleteEmployee(employee: Employee) {
    return this.afs
      .collection("employees")
      .doc(employee.id)
      .delete();
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
        imgUrl: employee.imgUrl,
        employeed: employee.employeed,
        clockedIn: employee.clockedIn,
        clockedInTime: employee.clockedInTime,
        floorEmployee: employee.floorEmployee
      });
  }
}
