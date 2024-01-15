import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { MenuItemService } from 'src/app/_services/menu-item.service';
import { MenuItem } from 'src/app/_models/menu-item.model';

const DEFAULT_IMG_SRC = 'path_to_default_placeholder_image'; // Replace with your actual default image path

@Component({
  selector: 'app-edit-item-dialog',
  templateUrl: './edit-item-dialog.component.html',
  styleUrls: ['./edit-item-dialog.component.scss']
})
export class EditItemDialogComponent implements OnInit {
  imgSrc: string;
  selectedImage: any = null;
  public editMenuItemForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private menuItemService: MenuItemService,
    private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<EditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItem
  ) {
    this.editMenuItemForm = this.formBuilder.group({
      name: new FormControl(data.name),
      description: new FormControl(data.description),
      price: new FormControl(data.price),
      imageUrl: new FormControl(data.imageUrl),
      fileName: new FormControl('')
    });

    this.imgSrc = data.imageUrl || DEFAULT_IMG_SRC; // Set default image path
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit() {
    if (this.selectedImage) {
      this.handleImageUpdate().then(newImageUrl => {
        if (newImageUrl) {
          this.editMenuItemForm.get('imageUrl').setValue(newImageUrl);
        }
        this.updateMenuItem();
      });
    } else {
      this.updateMenuItem();
    }
  }

  async handleImageUpdate(): Promise<string | null> {
    if (this.selectedImage) {
      // If there's an old image URL, delete the old image
      if (this.data.imageUrl) {
        const oldImageRef = this.storage.refFromURL(this.data.imageUrl);
        await oldImageRef.delete().toPromise().catch(error => {
          console.error('Error deleting old image:', error);
        });
      }

      // Upload new image and return the new URL
      const filePath = `menuItemPictures/${this.selectedImage.name}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      await this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(async () => {
          // Do nothing here, as we'll handle the URL outside this block
        })
      ).toPromise();

      // Get and return the new image URL
      return await fileRef.getDownloadURL().toPromise();
    }

    // If no new image is selected, return null
    return null;
  }

  updateMenuItem() {
    const updatedMenuItem: MenuItem = {
      ...this.data,
      ...this.editMenuItemForm.value
    };

    this.menuItemService.updateMenuItem(updatedMenuItem).then(() => {
      this.dialogRef.close({ menuItemUpdated: true });
    }).catch(error => {
      console.error('Error updating menu item:', error);
    });
  }


  detectNewImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Ensure the type of e.target.result is string
        this.imgSrc = e.target.result as string;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.editMenuItemForm.patchValue({ fileName: event.target.files[0].name });
      this.editMenuItemForm.markAsDirty();
    } else {
      this.imgSrc = this.data.imageUrl || DEFAULT_IMG_SRC; // Fallback to the current image or default
      this.selectedImage = null;
      this.editMenuItemForm.patchValue({ fileName: '' });
    }
  }
}  