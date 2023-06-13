import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/_services/auth.service';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
  isEditing: boolean = false;
  isUploading: boolean = false;
  totalImages: number = 0;
  uploadedImages: number = 0;
  progressBarValue: number = 0;
  uploadTask: AngularFireUploadTask;

  fileName = new FormControl(''); // Initialize form control
  imgSrcs: string[] = [];
  selectedImages: any[] = [];

  constructor(
    public authService: AuthService,
    private afAuth: AngularFireAuth,
    private _snackBar: MatSnackBar,
    private storage: AngularFireStorage,
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
    if ($event.target.files && $event.target.files.length) {
      let newImages: File[] = Array.from($event.target.files);

      // Cap total images at 5, but allow new images to be added up to this cap
      if (this.imgSrcs.length + newImages.length > 5) {
        alert('You can only upload a maximum of 5 images');
        newImages = newImages.slice(0, 5 - this.imgSrcs.length); // Adjust to only accept as many new images as we have room for
      }

      // Append the new files to the selectedImages array
      this.selectedImages.push(...newImages);

      for (let i = 0; i < newImages.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imgSrcs.push(e.target.result);
        reader.readAsDataURL(newImages[i]);
      }
    }

    this.totalImages = this.selectedImages.length;
  }


  removeImage(index: number) {
    this.imgSrcs.splice(index, 1);
    this.selectedImages.splice(index, 1);
    this.totalImages = this.selectedImages.length;
  }

  // Upload the images
  uploadImages() {
    this.isUploading = true;

    if (!this.selectedImages || this.selectedImages.length === 0) {
      this._snackBar.open('No image selected!', '', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['red-snackbar']
      });
      return;
    }

    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        // Save off the current selected image, then remove it from the array
        const imageToUpload = this.selectedImages[0];
        this.selectedImages.shift();

        // Create a Firebase storage reference
        const storageRef = this.storage.ref(`profilePictures/${this.userId}/${imageToUpload.name}`);

        // Upload the selected image
        const uploadTask = storageRef.put(imageToUpload);

        // Get notified when the download URL is available
        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            uploadTask.then(snapshot => {
              snapshot.ref.getDownloadURL().then(downloadURL => {
                // Call saveImageUrls() here for each individual image
                this.authService.saveImageUrl(this.userId, downloadURL)
                  .catch(error => {
                    console.error('Error saving image URL: ', error);
                    this._snackBar.open('Failed to save image URL!', '', {
                      horizontalPosition: this.horizontalPosition,
                      verticalPosition: this.verticalPosition,
                      duration: 2500,
                      panelClass: ['red-snackbar']
                    });
                  });

                // Update progress bar after each image upload
                this.progressBarValue = ((this.totalImages - this.selectedImages.length) / this.totalImages) * 100;

                if (this.selectedImages.length === 0) {
                  // All images uploaded
                  this.isUploading = false;
                  this._snackBar.open('Images upload completed!', '', {
                    horizontalPosition: this.horizontalPosition,
                    verticalPosition: this.verticalPosition,
                    duration: 2500,
                    panelClass: ['green-snackbar']
                  });
                  return;
                }

                // Call this function recursively to upload the next image
                this.uploadImages();
              });
            });
          })
        ).subscribe();
      }
    });
  }
}
