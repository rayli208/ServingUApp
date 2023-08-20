import { Component, OnInit } from '@angular/core';
import { Resume } from 'src/app/_models/resume.model';
import { AuthService } from 'src/app/_services/auth.service';
import { ResumesService } from 'src/app/_services/resumes.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'src/app/_dialogs/confirm/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-resume-dashboard',
  templateUrl: './resume-dashboard.component.html',
  styleUrls: ['./resume-dashboard.component.scss']
})
export class ResumeDashboardComponent implements OnInit {
  userId: string;
  resumes: Resume[] = [];
  filterArchived: string = 'no';

  constructor(
    public authService: AuthService,
    private resumesService: ResumesService,
    private _snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.authService.getAuthState().subscribe(user => {
      if (user) {
        this.userId = user.uid;
        this.fetchResumes();
      }
    });
  }

  fetchResumes(): void {
    this.resumesService.getResumesListForUser(this.userId).subscribe(data => {
      this.resumes = data.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as Resume
        };
      });
    });
  }

  filteredResumes(): Resume[] {
    if (this.filterArchived === 'yes') {
      return this.resumes.filter(resume => resume.archived);
    } else {
      return this.resumes.filter(resume => !resume.archived);
    }
  }

  formatTimestamp(timestamp: any): string {
    let date = new Date(timestamp.seconds * 1000);

    let dateOptions: Intl.DateTimeFormatOptions = {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    };

    let timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    return date.toLocaleDateString('en-US', dateOptions) + ' at ' + date.toLocaleTimeString('en-US', timeOptions);
  }

  // Function to toggle the archived status of a resume
  toggleArchiveStatus(resume: Resume) {
    this.resumesService.toggleArchiveStatus(resume).then(() => {
      // Handle successful toggle. For example, refetch the data or update the UI.
      this.fetchResumes();
    }).catch(error => {
      console.error("Error toggling archive status:", error);
    });
  }

  deleteResume(resume: Resume) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        text: `Are you sure you want to delete this resume?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resumesService.deleteResume(resume).then(() => {
          // Handle successful delete. For example, refetch the data or update the UI.
          this.fetchResumes();
          this._snackBar.open('Resume deleted successfully!', '', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        }).catch(error => {
          console.error("Error deleting resume:", error);
          this._snackBar.open('Error deleting resume!', '', {
            horizontalPosition: 'right',
            verticalPosition: 'top',
            duration: 2500,
            panelClass: ['red-snackbar']
          });
        });
      }
    });
  }
}
