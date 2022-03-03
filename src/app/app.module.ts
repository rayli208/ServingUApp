import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//App Components
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { HiringDashboardComponent } from './hiring-dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { TimesheetDashboardComponent } from './timesheet-dashboard/timesheet-dashboard.component';
import { CreateEmployeeDialogComponent } from './_dialogs/employee/create-employee-dialog/create-employee-dialog.component';

//Mat Components
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { environment } from '../environments/environment';

import { ToastrModule } from 'ngx-toastr';
import { EditEmployeeDialogComponent } from './_dialogs/employee/edit-employee-dialog/edit-employee-dialog.component';
import { EditJobDialogComponent } from './_dialogs/jobs/edit-job-dialog/edit-job-dialog.component';
import { CreateJobDialogComponent } from './_dialogs/jobs/create-job-dialog/create-job-dialog.component';
import { CreateScheduleDialogComponent } from './_dialogs/schedules/create-schedule-dialog/create-schedule-dialog.component';
import { EditScheduleDialogComponent } from './_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { HoursPipe } from './_pipes/hours.pipe';


@NgModule({
    declarations: [
        AppComponent,
        SignupComponent,
        LoginComponent,
        ForgotPasswordComponent,
        VerifyEmailComponent,
        HiringDashboardComponent,
        AdminDashboardComponent,
        PageNotFoundComponent,
        EmployeeDashboardComponent,
        TimesheetDashboardComponent,
        CreateEmployeeDialogComponent,
        EditEmployeeDialogComponent,
        EditJobDialogComponent,
        CreateJobDialogComponent,
        CreateScheduleDialogComponent,
        EditScheduleDialogComponent,
        HoursPipe
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),  // imports firebase/app needed for everything,
        AngularFireStorageModule, //imports storage bin
        AngularFirestoreModule,  // imports firebase/firestore, only needed for database features
        AngularFireDatabaseModule,
        //Mat Components
        MatAutocompleteModule,
        MatBadgeModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
