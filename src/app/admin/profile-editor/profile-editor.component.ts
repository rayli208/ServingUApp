import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent implements OnInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  user: any;
  userId: string;
  isEditing = false;


  fileName = new FormControl(''); // Initialize form control
  imgSrcs: string[] = [];
  selectedImages: any[] = [];



  constructor(
    public authService: AuthService,
    private _snackBar: MatSnackBar,
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        let emailLower = user.email.toLowerCase();
        console.log(emailLower);
        this.authService.getCurrentUserInfo(emailLower).subscribe(userInfo => {
          this.user = userInfo;
        });
      }
    });
  }

  enableEditing(): void {
    this.isEditing = true;
  }

  saveChanges(): void {
    let emailLower = this.user.email.toLowerCase();
    this.authService.updateUser(emailLower, this.user).then(() => {
      this.isEditing = false;
      this._snackBar.open('User profile has been updated!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['green-snackbar']
      });
    }).catch(error => {
      console.error('Error updating user: ', error);
      this._snackBar.open('Failed to update user profile!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['red-snackbar']
      });
    });
  }

  detectNewImage($event: any) {
    if (this.imgSrcs.length >= 5) {
      alert('You can only upload a maximum of 5 images');
      return;
    }

    if ($event.target.files && $event.target.files.length) {
      let remainingSpots = 5 - this.imgSrcs.length;
      let filesToUpload = Array.from($event.target.files).slice(0, remainingSpots);
      this.selectedImages = filesToUpload;

      for (let i = 0; i < this.selectedImages.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imgSrcs.push(e.target.result);
        reader.readAsDataURL(this.selectedImages[i]);
      }
    } else {
      this.selectedImages = [];
    }
  }

  removeImage(index: number) {
    this.imgSrcs.splice(index, 1);
  }
}
