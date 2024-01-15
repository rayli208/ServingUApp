import { Component, Inject } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuItemService } from 'src/app/_services/menu-item.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

const DEFAULT_IMG_SRC = '../../../../assets/img/placeholder-food.png';

@Component({
  selector: 'app-create-item-dialog',
  templateUrl: './create-item-dialog.component.html',
  styleUrls: ['./create-item-dialog.component.scss']
})
export class CreateItemDialogComponent {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  menuItemForm: UntypedFormGroup;
  selectedImage: any = null;
  isSubmitted: boolean = false;
  imgSrc: string = DEFAULT_IMG_SRC;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private menuItemService: MenuItemService,
    private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<CreateItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sectionId: string, uid: string, maxOrder: number },
    private _snackBar: MatSnackBar
  ) {
    this.menuItemForm = this.formBuilder.group({
      sectionId: new FormControl(this.data.sectionId),
      order: new FormControl(this.data.maxOrder + 1),
      name: new FormControl(''),
      description: new FormControl(''),
      price: new FormControl(null),
      fileName: new FormControl(''),
      imageUrl: new FormControl('')  // Add imageUrl field to the form
    });
  }

  onSubmit() {
    this.isSubmitted = true;

    // If no image is selected, submit the form without an image
    if (!this.selectedImage) {
      this.submitMenuItemForm();
      return;
    }

    // If an image is selected, upload it first
    var filePath = `menuItemPictures/${this.selectedImage.name}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);

    this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(async () => {
        const url = await fileRef.getDownloadURL().toPromise();
        this.menuItemForm.patchValue({ imageUrl: url });
        this.submitMenuItemForm();
      })
    ).subscribe();
  }

  // New method to handle form submission
  submitMenuItemForm() {
    this.menuItemService.createMenuItem(this.menuItemForm.value)
      .then(() => {
        this.showSnackBar("Menu item has been created!", 'green-snackbar');
        this.dialogRef.close({ menuItemCreated: true });
      })
      .catch(error => {
        console.error("Error creating menu item:", error);
        this.showSnackBar("Error creating menu item!", 'red-snackbar');
      })
      .finally(() => this.isSubmitted = false);
  }

  detectNewImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.menuItemForm.patchValue({ fileName: event.target.files[0].name });
    } else {
      this.imgSrc = DEFAULT_IMG_SRC;
      this.selectedImage = null;
      this.menuItemForm.patchValue({ fileName: '' });
    }
  }

  showSnackBar(message: string, color: string) {
    this._snackBar.open(message, '', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2500,
      panelClass: [color]
    });
  }
}
