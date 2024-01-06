import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/_services/auth.service';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

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

  fileName = new FormControl('');
  imgSrcs: string[] = [];
  selectedImages: any[] = [];

  imageCount: number = 0;
  isImageLimitReached: boolean = false;
  imageUrls$: Observable<string[]>;
  imageUrls: string[] = [];

  constructor(
    public authService: AuthService,
    private _snackBar: MatSnackBar,
    private storage: AngularFireStorage,
    private changeDetector: ChangeDetectorRef,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
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
          this.isImageLimitReached = this.imageCount >= 5;
        });

        this.imageUrls$ = this.authService.getImageUrls(this.userId);
        this.imageUrls$.subscribe(urls => {
          this.imageUrls = urls;
        });
      }
    });
  }

  get safeDescription() {
    return this.sanitizer.bypassSecurityTrustHtml(this.user.description);
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
      if (this.isImageLimitReached) {
        alert('You have reached the limit of 5 images.');
        return;
      }

      let newImages: File[] = Array.from($event.target.files);
      let freeSlots = 5 - this.imageCount - this.selectedImages.length;

      if (newImages.length > freeSlots) {
        alert(`You can only select a maximum of ${freeSlots} more image(s)`);
        newImages = newImages.slice(0, freeSlots);
      }

      this.selectedImages.push(...newImages);

      for (let i = 0; i < newImages.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.imgSrcs.push(e.target.result);
        reader.readAsDataURL(newImages[i]);
      }

      this.totalImages = this.selectedImages.length;
      this.isImageLimitReached = this.imageCount + this.totalImages >= 5;
    }
  }

  removeImage(index: number) {
    this.imgSrcs.splice(index, 1);
    this.selectedImages.splice(index, 1);
    this.totalImages = this.selectedImages.length;
    this.isImageLimitReached = this.imageCount + this.totalImages >= 5;
  }

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

    const imageToUpload = this.selectedImages.shift();
    const storageRef = this.storage.ref(`profilePictures/${this.userId}/${imageToUpload.name}`);
    const uploadTask = storageRef.put(imageToUpload);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        uploadTask.then(snapshot => {
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.imageUrls.push(downloadURL);
            this.imageUrls$ = of(this.imageUrls);
            
            this.authService.addImageRecord(this.userId, downloadURL).then(() => {
              console.log("Image record added to Firestore");
            }).catch(error => {
              console.error("Failed to add image record:", error);
            });

            this.progressBarValue = ((this.totalImages - this.selectedImages.length) / this.totalImages) * 100;

            if (this.selectedImages.length > 0) {
              this.uploadImages();
            } else {
              this.isUploading = false;
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

            this.authService.getImageCount(this.userId).subscribe(count => {
              this.imageCount = count;
              this.isImageLimitReached = this.imageCount >= 5;
            });
          });
        });
      })
    ).subscribe();
  }

  confirmDelete(imageUrl): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete this image?`
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.storage.storage.refFromURL(imageUrl).delete().then(() => {
          this.authService.deleteImageRecord(this.userId, imageUrl).then(() => {
            console.log("Image record deleted from Firestore");
          }).catch(error => {
            console.error("Failed to delete image record:", error);
          });

          this.authService.getImageCount(this.userId).subscribe(count => {
            this.imageCount = count;
            this.isImageLimitReached = this.imageCount >= 5;
          });
  
          const index = this.imageUrls.indexOf(imageUrl);
          if (index > -1) {
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
          console.error('Failed to delete image:', error);
          this._snackBar.open('Failed to delete image!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
      }
    });
  }
}
