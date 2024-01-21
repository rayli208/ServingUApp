import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { MenuItemService } from 'src/app/_services/menu-item.service';
import { MenuItem } from 'src/app/_models/menu-item.model';
import { Tag } from 'src/app/_models/tag.model';
import { HARDCODED_TAGS } from 'src/app/core/constants/tags';

const DEFAULT_IMG_SRC = '../../../../assets/img/placeholder-food.png';

@Component({
  selector: 'app-edit-item-dialog',
  templateUrl: './edit-item-dialog.component.html',
  styleUrls: ['./edit-item-dialog.component.scss']
})
export class EditItemDialogComponent implements OnInit {
  imgSrc: string;
  selectedImage: any = null;
  public editMenuItemForm: FormGroup;
  availableTags: Tag[] = HARDCODED_TAGS;
  tempSelectedTags: Tag[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private menuItemService: MenuItemService,
    private storage: AngularFireStorage,
    public dialogRef: MatDialogRef<EditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MenuItem
  ) {
    this.editMenuItemForm = this.formBuilder.group({
      name: new FormControl(data?.name || ''),
      description: new FormControl(data?.description || ''),
      price: new FormControl(data?.price || null),
      imageUrl: new FormControl(data?.imageUrl || ''),
      fileName: new FormControl(''),
      tags: new FormControl(data?.tags || [])
    });

    this.imgSrc = data?.imageUrl || DEFAULT_IMG_SRC;
    this.tempSelectedTags = [...(data?.tags || [])];
  }

  ngOnInit(): void {}

  onSubmit() {
    this.editMenuItemForm.patchValue({ tags: this.tempSelectedTags });

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
    if (this.data.imageUrl) {
      const oldImageRef = this.storage.refFromURL(this.data.imageUrl);
      await oldImageRef.delete().toPromise().catch(error => {
        console.error('Error deleting old image:', error);
      });
    }

    const filePath = `menuItemPictures/${this.selectedImage.name}_${new Date().getTime()}`;
    const fileRef = this.storage.ref(filePath);
    await this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
      finalize(async () => {}))
    .toPromise();

    return await fileRef.getDownloadURL().toPromise();
  }

  updateMenuItem() {
    const updatedMenuItem: MenuItem = {
      ...this.data,
      ...this.editMenuItemForm.value,
      tags: this.tempSelectedTags
    };

    this.menuItemService.updateMenuItem(updatedMenuItem).then(() => {
      this.dialogRef.close({ menuItemUpdated: true, updatedMenuItem });
    }).catch(error => {
      console.error('Error updating menu item:', error);
    });
  }

  detectNewImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imgSrc = e.target.result as string;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      this.editMenuItemForm.patchValue({ fileName: event.target.files[0].name });
      this.editMenuItemForm.markAsDirty();
    } else {
      this.imgSrc = this.data.imageUrl || DEFAULT_IMG_SRC;
      this.selectedImage = null;
      this.editMenuItemForm.patchValue({ fileName: '' });
    }
  }

  onTagChange(tag: Tag, isChecked: boolean) {
    if (isChecked) {
      this.tempSelectedTags.push(tag);
    } else {
      this.tempSelectedTags = this.tempSelectedTags.filter(t => t.abbreviation !== tag.abbreviation);
    }
    this.editMenuItemForm.markAsDirty();
  }

  isTagSelected(tag: Tag): boolean {
    return this.tempSelectedTags.some(t => t.abbreviation === tag.abbreviation);
  }
}
