import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, Subject, catchError, from, of, switchMap, takeUntil } from 'rxjs';
import { Section } from '../_models/section.model'; // Adjust the path as necessary
import { SectionService } from '../_services/section.service'; // Adjust the path as necessary
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { CreateMenuItemDialogComponent } from '../_dialogs/menu-items/create-menu-item-dialog/create-menu-item-dialog.component';
import { MenuItemService } from '../_services/menu-item.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MenuItem } from '../_models/menu-item.model';

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

  editSection(sectionId: string, event: Event): void {
    event.stopPropagation();
    this.editingSectionId = sectionId;
    this.editingSection = { ...this.sections.find(section => section.id === sectionId) };
  }

  addSection(): void {
    if (this.newSectionName) {
      const newSection: Section = {
        uid: this.userId,
        name: this.newSectionName,
        order: this.sections.length + 1
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

  saveSection(event: Event): void {
    event.stopPropagation();
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

  deleteSection(sectionId: string, event: Event): void {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { text: `Are you sure you want to delete this section and all its menu items?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Fetch all menu items for the section, including their document IDs
        this.afs.collection<MenuItem>('menuItems', ref => ref.where('sectionId', '==', sectionId)).snapshotChanges().pipe(
          switchMap(changes => {
            // Create an array of deletion promises for each menu item
            const deletionPromises = changes.map(change => {
              const menuItemId = change.payload.doc.id;
              const menuItemData = change.payload.doc.data() as MenuItem;
              const imageRef = this.storage.refFromURL(menuItemData.imageUrl);
              return imageRef.delete().toPromise().then(() => {
                return this.afs.collection('menuItems').doc(menuItemId).delete();
              });
            });
            return from(Promise.all(deletionPromises));
          }),
          catchError(error => {
            console.error('Error deleting menu items:', error);
            return of(null);
          }),
          switchMap(() => this.afs.collection('sections').doc(sectionId).delete())
        ).subscribe(() => {
          this.sections = this.sections.filter(section => section.id !== sectionId);
          this.updateSectionOrders();
          this._snackBar.open('Section and its menu items have been deleted!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        }, error => {
          console.error('Error deleting section:', error);
          this._snackBar.open('Error deleting section!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
      }
    });
  }

  cancelEdit(event: Event): void {
    event.stopPropagation();
    this.editingSectionId = null;
    this.editingSection = null;
  }

  updateSectionOrders(): void {
    this.sections.forEach((section, index) => {
      section.order = index + 1;
      this.sectionService.updateSection(section);
    });
  }

  openCreateMenuItemDialog(sectionId: string, event): void {
    event.stopPropagation();
    
    // Fetch the maximum order number of menu items in this section
    this.menuItemService.getMenuItemsForSection(sectionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(menuItems => {
        const maxOrder = menuItems.length > 0 ? Math.max(...menuItems.map(item => item.order)) : 0;

        const dialogRef = this.dialog.open(CreateMenuItemDialogComponent, {
          width: '400px',
          data: {
            sectionId: sectionId,
            uid: this.userId,
            maxOrder: maxOrder
          }
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result?.menuItemCreated) {
            this.updateSectionMenuItems(sectionId);
            // Refresh or update the menu items list for the section
            this._snackBar.open('Menu item has been created!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['green-snackbar']
            });
          }
        });
      });
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
