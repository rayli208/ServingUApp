import { Component, Inject } from '@angular/core';
import { FormControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuItemService } from 'src/app/_services/menu-item.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { MenuItem } from 'src/app/_models/menu-item.model';

const DEFAULT_IMG_SRC = '../../../../assets/img/placeholder-food.png';

@Component({
  selector: 'app-create-menu-item-dialog',
  templateUrl: './create-menu-item-dialog.component.html',
  styleUrls: ['./create-menu-item-dialog.component.scss']
})
export class CreateMenuItemDialogComponent {
  menuItemForm: UntypedFormGroup;
  selectedImage: any = null;
  isSubmitted: boolean = false;
  imgSrc: string = DEFAULT_IMG_SRC;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private menuItemService: MenuItemService,
    private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<CreateMenuItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sectionId: string, uid: string, maxOrder: number }
  ) {
    this.menuItemForm = this.formBuilder.group({
      sectionId: new FormControl(this.data.sectionId),
      order: new FormControl(this.data.maxOrder + 1),
      name: new FormControl(''),
      description: new FormControl(''),
      price: new FormControl(null),
      fileName: new FormControl('')
    });
  }

  onSubmit() {
    console.log("Submitting form for menu item", this.menuItemForm.value);

    this.isSubmitted = true;
    if (this.selectedImage) {
      const menuItemData: MenuItem = {
        uid: this.data.uid,
        order: this.data.maxOrder + 1,
        sectionId: this.data.sectionId,
        name: this.menuItemForm.value.name,
        description: this.menuItemForm.value.description,
        price: this.menuItemForm.value.price
      };
  
      this.menuItemService.createMenuItem(menuItemData, this.selectedImage)
        .then(() => {
          this.dialogRef.close({menuItemCreated: true});
        })
        .catch(error => {
          console.error("Error creating menu item:", error);
          // Show error message to user
          this.isSubmitted = false;
        });
    } else {
      // Handle case where no image is selected
      this.isSubmitted = false;
      // Show error message about missing image
    }
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
}
