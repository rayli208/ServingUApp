import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { Section } from '../_models/section.model'; // Adjust the path as necessary
import { SectionService } from '../_services/section.service'; // Adjust the path as necessary
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-menu-builder-dashboard',
  templateUrl: './menu-builder-dashboard.component.html',
  styleUrls: ['./menu-builder-dashboard.component.scss']
})

export class MenuBuilderDashboardComponent implements OnInit {
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
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.user = null;
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.sectionService.getSectionsListForUser(this.userId).subscribe(data => {
          this.sections = data.map(e => {
            return {
              id: e.payload.doc.id,
              ...e.payload.doc.data() as Section
            };
          });
        });
      }
    });
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
      data: {
        text: `Are you sure you want to delete this section?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sectionService.deleteSection(sectionId).then(() => {
          this.sections = this.sections.filter(section => section.id !== sectionId);
          this.updateSectionOrders();
          this._snackBar.open('Section has been deleted!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        }).catch(error => {
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
}
