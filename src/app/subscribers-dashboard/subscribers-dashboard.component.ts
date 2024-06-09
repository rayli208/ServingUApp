import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { Subscriber } from '../_models/subscriber.model';
import { SubscribersService } from '../_services/subscribers.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { MessagesService } from '../_services/messages.service';
import { AuthService } from '../_services/auth.service';
import { Message } from '../_models/message.model';

@Component({
  selector: 'app-subscribers-dashboard',
  templateUrl: './subscribers-dashboard.component.html',
  styleUrls: ['./subscribers-dashboard.component.scss']
})
export class SubscribersDashboardComponent implements OnInit, AfterViewInit {
  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  userId: string;
  dataSource: MatTableDataSource<Subscriber>;
  displayedColumns = ['select', 'name', 'phone', 'email'];
  selection = new SelectionModel<Subscriber>(true, []);
  editMode = false;
  editingRow: string | null = null;
  messageMode = false;
  messageText = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public afAuth: AngularFireAuth,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog,
    private subscribersService: SubscribersService,
    private messagesService: MessagesService,
    private authService: AuthService
  ) {
    this.dataSource = new MatTableDataSource<Subscriber>([]);
  }

  ngOnInit(): void {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userId = user.uid;

        // Fetch subscribers for this user
        this.subscribersService.getSubscribersListForUser(this.userId).subscribe(res => {
          const subscribers = res.map(e => ({
            id: e.payload.doc.id,
            ...e.payload.doc.data() as Subscriber
          }));
          this.dataSource.data = subscribers;
        });
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.selection.select(...this.dataSource.data);
  }

  toggleRow(row: Subscriber) {
    this.selection.toggle(row);
  }

  toggleEditSave() {
    if (this.editMode && this.editingRow) {
      const subscriberToUpdate = this.dataSource.data.find(s => s.id === this.editingRow);
      if (subscriberToUpdate) {
        this.subscribersService.updateSubscriber(subscriberToUpdate.id, {
          name: subscriberToUpdate.name,
          phone: subscriberToUpdate.phone,
          email: subscriberToUpdate.email
        }).then(() => {
          this._snackBar.open('Subscriber updated successfully!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['green-snackbar']
          });
        }).catch(error => {
          this._snackBar.open('Failed to update subscriber: ' + error.message, 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
      }
    }

    this.editMode = !this.editMode;
    this.editingRow = this.editMode ? this.selection.selected[0]?.id : null;

    if (!this.editMode) {
      this.selection.clear();
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.editingRow = null;
    this.selection.clear();
  }

  deleteSelected() {
    const selectedIds = this.selection.selected.map(s => s.id);

    if (selectedIds.length > 1) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          text: `Are you sure you want to delete multiple subscribers?`
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.subscribersService.deleteMultipleSubscribers(selectedIds).then(() => {
            this._snackBar.open('Deleted timestamp!', '', {
              horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition,
              duration: 2500,
              panelClass: ['red-snackbar']
            });
            this.selection.clear();
          }).catch((error) => {
            console.error('Failed to delete subscribers: ' + error.message);
          });
        }
      });

    } else if (selectedIds.length === 1) {
      this.subscribersService.deleteSubscriber(selectedIds[0])
        .then(() => {
          this._snackBar.open('Subscriber deleted successfully!', '', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
          this.selection.clear();
        })
        .catch(error => {
          this._snackBar.open('Failed to delete subscriber: ' + error.message, 'Close', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
    }
  }

  isRowEditing(row: Subscriber) {
    return this.editMode && this.editingRow === row.id;
  }

  shouldShowCheckbox(row: Subscriber) {
    return !this.editMode || this.isRowEditing(row);
  }

  formatPhone(phone: string): string | null {
    if (!phone) {
      return null;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone;
  }

  toggleMessageMode() {
    this.messageMode = !this.messageMode;
    if (!this.messageMode) {
      this.messageText = '';
    }
  }

  cancelMessage() {
    this.messageMode = false;
    this.messageText = '';
  }

  confirmSendText() {
    const totalMessagesCount = Math.ceil(this.messageText.length / 153) * this.selection.selected.length;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to send ${totalMessagesCount} messages?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sendTextMessages();
      }
    });
  }

  sendTextMessages() {
    const totalMessagesCount = Math.ceil(this.messageText.length / 153) * this.selection.selected.length;
    const promises = this.selection.selected.map(subscriber => {
      const message: Message = {
        channelId: 'a31f78766da04f9e95ce52a85cf13bdd',
        to: '1' + subscriber.phone.replace(/-/g, ''),
        type: 'text',
        content: {
          text: this.messageText
        }
      };
      return this.messagesService.createMessage(message);
    });

    Promise.all(promises).then(() => {
      this.authService.updateTextsThisMonth(totalMessagesCount).then(() => {
        this._snackBar.open('Text messages sent successfully!', '', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['green-snackbar']
        });
      }).catch((error) => {
        this._snackBar.open('Failed to update textsThisMonth: ' + error.message, 'Close', {
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition,
          duration: 2500,
          panelClass: ['red-snackbar']
        });
      });
    }).catch((error) => {
      this._snackBar.open('Failed to send some text messages: ' + error.message, 'Close', {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2500,
        panelClass: ['red-snackbar']
      });
    });

    this.messageMode = false;
    this.messageText = '';
  }
}
