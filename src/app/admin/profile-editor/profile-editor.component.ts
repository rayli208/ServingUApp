import { Component, OnInit } from '@angular/core';
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
}
