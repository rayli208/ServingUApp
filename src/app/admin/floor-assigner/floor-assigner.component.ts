import { Component, Input, OnInit, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { Floor } from 'src/app/_models/floor.model';
import { FloorsService } from 'src/app/_services/floor.service';

@Component({
  selector: 'app-floor-assigner',
  templateUrl: './floor-assigner.component.html',
  styleUrls: ['./floor-assigner.component.scss']
})
export class FloorAssignerComponent implements OnInit, OnChanges {
  @Input() userId: string;
  floorForm: FormGroup;
  floorNumbers: number[] = Array.from({ length: 10 }, (_, i) => i + 1);
  floors$: Observable<Floor[]>;
  usedFloorNumbers: number[] = [];
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private formBuilder: FormBuilder,
    private floorsService: FloorsService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.floorForm = this.formBuilder.group({
      floorNumber: ['', [Validators.required]],
      floorName: ['', [Validators.required]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.userId && changes.userId.currentValue) {
      this.floors$ = this.floorsService.getFloorsForUser(this.userId).pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Floor;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      );

      // Subscribe to the floors and update the used floor numbers whenever they change
      this.floors$.subscribe(floors => {
        this.usedFloorNumbers = floors.map(floor => floor.floorNumber);
        // Sort the floors by floor number
        floors.sort((a, b) => a.floorNumber - b.floorNumber);
      });
    }
  }

  onSubmit(formDirective: FormGroupDirective) {
    if (this.floorForm.valid) {
      const newFloor: Floor = {
        floorNumber: this.floorForm.value.floorNumber,
        floorName: this.floorForm.value.floorName
      };
      this.floorsService.createFloor(this.userId, newFloor)
        .then(() => {
          this._snackBar.open('Floor created successfully!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          });
          this.floorForm.reset();
          formDirective.resetForm();
        })
        .catch(error => {
          console.error('Error creating floor:', error);
          this._snackBar.open('Error creating floor!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
    }
  }

  editFloor(floor: Floor) {
    floor.editing = true;
  }

  saveChanges(floor: Floor) {
    floor.editing = false;
    this.floorsService.updateFloor(this.userId, floor)
      .then(() => {
        this._snackBar.open('Floor updated successfully!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['yellow-snackbar']
        });
      })
      .catch(error => {
        console.error('Error updating floor:', error);
        this._snackBar.open('Error updating floor!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
  }

  confirmDelete(floor: Floor) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete this floor?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.floorsService.deleteFloor(this.userId, floor)
          .then(() => {
            this._snackBar.open('Floor deleted successfully!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['red-snackbar']
            });
          })
          .catch(error => {
            console.error('Error deleting floor:', error);
            this._snackBar.open('Error deleting floor!', '', {
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
