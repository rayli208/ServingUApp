import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
  
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor(private toastr: ToastrService) { }
  
  showSuccess(message: string, title: string){
      this.toastr.success(message, title, {
        positionClass: 'toast-bottom-right' 
     });
  }
  
  showError(message: string, title: string){
      this.toastr.error(message, title, {
        positionClass: 'toast-bottom-right' 
     })
  }
  
  showInfo(message: string, title: string){
      this.toastr.info(message, title, {
        positionClass: 'toast-bottom-right' 
     })
  }
  
  showWarning(message: string, title: string){
      this.toastr.warning(message, title, {
        positionClass: 'toast-bottom-right' 
     })
  }
  
}