import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, Subject, catchError, from, of, switchMap, take, takeUntil, throwError } from 'rxjs';
import { Section } from '../_models/section.model'; // Adjust the path as necessary
import { SectionService } from '../_services/section.service'; // Adjust the path as necessary
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { MenuItemService } from '../_services/menu-item.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuItem } from '../_models/menu-item.model';
import { CreateItemDialogComponent } from '../_dialogs/menu-items/create-item-dialog/create-item-dialog.component';

@Component({
  selector: 'app-menu-builder-dashboard',
  templateUrl: './menu-builder-dashboard.component.html',
  styleUrls: ['./menu-builder-dashboard.component.scss']
})

export class MenuBuilderDashboardComponent implements OnInit {
  private destroy$ = new Subject<void>();
  userId: string;
  user: Observable<any>;
  sections: Section[] = [];
  newSectionName: string = '';
  editingSectionId: string | null = null;
  editingSection: Section | null = null;
  showAddSection: boolean = false;

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    public afAuth: AngularFireAuth,
    private sectionService: SectionService,
    private menuItemService: MenuItemService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private storage: AngularFireStorage,
    private afs: AngularFirestore
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.loadSectionsWithMenuItems();
      }
    });
  }

  ngOnDestroy() {
    // Complete the subject to unsubscribe from all observables using takeUntil
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAddSectionClick(): void {
    this.showAddSection = true;
  }

  editSection(sectionId: string): void {

    this.editingSectionId = sectionId;
    this.editingSection = { ...this.sections.find(section => section.id === sectionId) };
  }

  addSection(): void {
    if (this.newSectionName) {
      const newSection: Section = {
        uid: this.userId,
        name: this.newSectionName,
        order: this.sections?.length + 1
      };
      this.sectionService.createSection(newSection).then(docRef => {
        const sectionWithId: Section = { ...newSection, id: docRef.id };
        this.sections.push(sectionWithId);
        this.newSectionName = '';
        this.showAddSection = false;
        this._snackBar.open('Section has been created!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      });
    }
  }

  saveSection(): void {

    if (this.editingSection) {
      this.sectionService.updateSection(this.editingSection).then(() => {
        this.editingSectionId = null;
        const index = this.sections.findIndex(section => section.id === this.editingSection!.id);
        if (index > -1) {
          this.sections[index] = { ...this.editingSection };
        }
        this._snackBar.open('Section has been edited!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      });
    }
  }

  deleteSection(sectionId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { text: `Are you sure you want to delete this section and all its menu items?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteSectionWithItems(sectionId).then(() => {
          this._snackBar.open('Section and its menu items have been deleted!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        }).catch(error => {
          this._snackBar.open('Error occurred during deletion!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
          console.error('Error during deletion:', error);
        });
      }
    });
  }

  async deleteSectionWithItems(sectionId: string): Promise<void> {
    const menuItems = await this.afs.collection<MenuItem>('menuItems', ref => ref.where('sectionId', '==', sectionId)).get().toPromise();

    // Batch operation starts here
    const batch = this.afs.firestore.batch();

    for (const doc of menuItems.docs) {
      const menuItemId = doc.id;
      const menuItemData = doc.data() as MenuItem;

      if (menuItemData.imageUrl) {
        const imageRef = this.storage.refFromURL(menuItemData.imageUrl);

        try {
          await imageRef.delete().toPromise();
          console.log(`Image deleted: ${menuItemData.imageUrl}`);
        } catch (error) {
          // Only log error, don't throw to continue with batch deletion
          console.error(`Error deleting image: ${error.message}`);
        }
      }

      // Delete document reference in batch
      const menuItemDocRef = this.afs.collection('menuItems').doc(menuItemId).ref;
      batch.delete(menuItemDocRef);
    }

    // Delete the section as part of the batch
    const sectionDocRef = this.afs.collection('sections').doc(sectionId).ref;
    batch.delete(sectionDocRef);

    // Commit the batch
    await batch.commit();
  }

  cancelEdit(): void {

    this.editingSectionId = null;
    this.editingSection = null;
  }

  updateSectionOrders(): void {
    this.sections.forEach((section, index) => {
      section.order = index + 1;
      this.sectionService.updateSection(section);
    });
  }

  openCreateMenuItemDialog(sectionId: string): void {
    console.log("openCreateMenuItemDialog called for section", sectionId);

    // Call a method to get the count of menu items
    this.getMenuItemsCount(sectionId).then(maxOrder => {
      const dialogRef = this.dialog.open(CreateItemDialogComponent, {
        width: '400px',
        data: { sectionId: sectionId, uid: this.userId, maxOrder: maxOrder }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log("Dialog closed with result:", result);
        if (result?.menuItemCreated) {
          this.updateSectionMenuItems(sectionId);
        }
      });
    }).catch(error => {
      console.error("Error fetching menu items count:", error);
      // Handle error appropriately
    });
  }

  // Method to asynchronously get the count of menu items for a section
  private async getMenuItemsCount(sectionId: string): Promise<number> {
    try {
      const menuItems = await this.menuItemService.getMenuItemsForSection(sectionId).pipe(take(1)).toPromise();
      return menuItems.length;
    } catch (error) {
      console.error("Error in getMenuItemsCount:", error);
      throw error; // Rethrow error to handle in the calling method
    }
  }


  loadSectionsWithMenuItems(): void {
    this.sectionService.getSectionsListForUser(this.userId).subscribe(sectionsData => {
      this.sections = sectionsData.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as Section,
          menuItems: []  // Initialize menuItems array
        };
      });
      this.sections.forEach(section => {
        this.updateSectionMenuItems(section.id);
      });
    });
  }

  updateSectionMenuItems(sectionId: string): void {
    this.menuItemService.getMenuItemsForSection(sectionId).subscribe(menuItems => {
      const sectionIndex = this.sections.findIndex(section => section.id === sectionId);
      if (sectionIndex > -1) {
        this.sections[sectionIndex].menuItems = menuItems;
      }
    });
  }
}
