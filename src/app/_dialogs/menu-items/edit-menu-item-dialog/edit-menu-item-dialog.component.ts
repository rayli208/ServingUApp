import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { MenuItemService } from 'src/app/_services/menu-item.service';
import { MenuItem } from 'src/app/_models/menu-item.model';

@Component({
  selector: 'app-edit-menu-item-dialog',
  templateUrl: './edit-menu-item-dialog.component.html',
  styleUrls: ['./edit-menu-item-dialog.component.scss']
})
export class EditMenuItemDialogComponent implements OnInit {
  imgSrc: string;
  selectedImage: any = null;
  public editMenuItemForm: UntypedFormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private menuItemService: MenuItemService,
    private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<EditMenuItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItem
  ) {
    this.editMenuItemForm = this.formBuilder.group({
      name: new FormControl(data.name),
      description: new FormControl(data.description),
      price: new FormControl(data.price),
      imageUrl: new FormControl(data.imageUrl),
      fileName: new FormControl('')
    });

    this.imgSrc = data.imageUrl || 'default_image_path'; // set default image path
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit() {
    if (this.selectedImage) {
      const filePath = `menuItemPictures/${this.selectedImage.name}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
  
      this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.editMenuItemForm.get('imageUrl').setValue(url);
            this.updateMenuItem();
          });
        })
      ).subscribe();
    } else {
      this.updateMenuItem();
    }
  }
  
  updateMenuItem() {
    const updatedMenuItem: MenuItem = {
      ...this.data,
      ...this.editMenuItemForm.value
    };
  
    this.menuItemService.updateMenuItem(updatedMenuItem).then(() => {
      this.dialogRef.close({menuItemUpdated: true});
    });
  }

  detectNewImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = e.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.editMenuItemForm.patchValue({ fileName: event.target.files[0].name });
    } else {
      this.selectedImage = null;
      this.editMenuItemForm.patchValue({ fileName: '' });
    }
  }
}
