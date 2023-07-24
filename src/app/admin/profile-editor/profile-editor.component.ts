import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/_services/auth.service';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, of } from 'rxjs';

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

  //Storage functionality
  imageCount: number = 0;
  isImageLimitReached: boolean = false;
  imageUrls$: Observable<string[]>;
  imageUrls: string[] = [];

  constructor(
    public authService: AuthService,
    private _snackBar: MatSnackBar,
    private storage: AngularFireStorage,
    private changeDetector: ChangeDetectorRef
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        let emailLower = user.email.toLowerCase();

        this.authService.getCurrentUserInfo(emailLower).subscribe(userInfo => {
          this.user = userInfo;
        });

        this.authService.getImageCount(this.userId).subscribe(count => {
          this.imageCount = count;
          // Check if the image limit has been reached
          this.isImageLimitReached = this.imageCount >= 5;
          console.log('Image count updated:', this.imageCount, 'Is limit reached:', this.isImageLimitReached);
        });

        this.imageUrls$ = this.authService.getImageUrls(this.userId);
        this.imageUrls$.subscribe(urls => {
          this.imageUrls = urls;
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
      // If image limit has been reached, ignore new selection
      if (this.isImageLimitReached) {
        alert('You have reached the limit of 5 images.');
        return;
      }

      let newImages: File[] = Array.from($event.target.files);
      let freeSlots = 5 - this.imageCount - this.selectedImages.length;

      // If the user tries to upload more images than there are free slots, alert the user and only accept as many images as there are free slots.
      if (newImages.length > freeSlots) {
        alert(`You can only select a maximum of ${freeSlots} more image(s)`);
        newImages = newImages.slice(0, freeSlots);
      }

      // Append the new files to the selectedImages array
      this.selectedImages.push(...newImages);

      for (let i = 0; i < newImages.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imgSrcs.push(e.target.result);
        reader.readAsDataURL(newImages[i]);
      }

      this.totalImages = this.selectedImages.length;
      // Check if the image limit has been reached
      this.isImageLimitReached = this.imageCount + this.totalImages >= 5;
      console.log('Image count after selection:', this.imageCount, 'Is limit reached:', this.isImageLimitReached);
    }
  }

  removeImage(index: number) {
    this.imgSrcs.splice(index, 1);
    this.selectedImages.splice(index, 1);
    this.totalImages = this.selectedImages.length;
    this.isImageLimitReached = this.imageCount + this.totalImages >= 5;
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

    // Save off the current selected image, then remove it from the array
    const imageToUpload = this.selectedImages.shift();

    // Create a Firebase storage reference
    const storageRef = this.storage.ref(`profilePictures/${this.userId}/${imageToUpload.name}`);

    // Upload the selected image
    const uploadTask = storageRef.put(imageToUpload);

    // Get notified when the download URL is available
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        uploadTask.then(snapshot => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            // Add the new image URL to the imageUrls array
            this.imageUrls.push(downloadURL);
            // Update the imageUrls$ Observable
            this.imageUrls$ = of(this.imageUrls);

            // Update progress bar after each image upload
            this.progressBarValue = ((this.totalImages - this.selectedImages.length) / this.totalImages) * 100;

            if (this.selectedImages.length > 0) {
              // If there are more images left to upload, call this function recursively
              this.uploadImages();
            } else {
              // All images uploaded
              this.isUploading = false;
              // Reset the selected images array, display array and progress bar
              this.selectedImages = [];
              this.imgSrcs = [];
              this.totalImages = 0;
              this.progressBarValue = 0;
              this.changeDetector.detectChanges();
              this._snackBar.open('Images upload completed!', '', {
                horizontalPosition: this.horizontalPosition,
                verticalPosition: this.verticalPosition,
                duration: 2500,
                panelClass: ['green-snackbar']
              });
            }

            // After each successful image upload, fetch the updated count
            this.authService.getImageCount(this.userId).subscribe(count => {
              this.imageCount = count;
              // Check if the image limit has been reached
              this.isImageLimitReached = this.imageCount >= 5;
              console.log('Image count after upload:', this.imageCount, 'Is limit reached:', this.isImageLimitReached);
            });
          });
        });
      })
    ).subscribe();
  }

  confirmDelete(imageUrl): void {
    let confirmation = confirm('Are you sure you want to delete this image?');
    if (confirmation) {
      this.storage.storage.refFromURL(imageUrl).delete().then(() => {
        // Once the image is deleted, update the user's image count and refresh the list of images
        this.authService.getImageCount(this.userId).subscribe(count => {
          this.imageCount = count;
          // Check if the image limit has been reached
          this.isImageLimitReached = this.imageCount >= 5;
          console.log('Image count after deletion:', this.imageCount, 'Is limit reached:', this.isImageLimitReached);
        });

        // Find the index of the image in the array
        const index = this.imageUrls.indexOf(imageUrl);
        if (index > -1) {
          // Use splice to remove the image from the array
          this.imageUrls.splice(index, 1);
        }

        this._snackBar.open('Image Deleted!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });

        this.changeDetector.detectChanges();
      }).catch(error => {
        // Handle any errors that occur during the deletion
        console.error('Failed to delete image:', error);
        this._snackBar.open('Failed to delete image!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
    }
  }
}
