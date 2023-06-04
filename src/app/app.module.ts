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
import { HiringDashboardComponent } from './hiring-dashboard/hiring-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { ScheduleDashboardComponent } from './schedule-dashboard/schedule-dashboard.component';
import { CreateEmployeeDialogComponent } from './_dialogs/employee/create-employee-dialog/create-employee-dialog.component';

//Mat Components
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatLegacySliderModule as MatSliderModule } from '@angular/material/legacy-slider';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatTreeModule } from '@angular/material/tree';
import {DragDropModule} from '@angular/cdk/drag-drop';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { environment } from '../environments/environment';

import { EditEmployeeDialogComponent } from './_dialogs/employee/edit-employee-dialog/edit-employee-dialog.component';
import { EditJobDialogComponent } from './_dialogs/jobs/edit-job-dialog/edit-job-dialog.component';
import { EditTableDialogComponent } from './_dialogs/tables/edit-table-dialog/edit-table-dialog.component';
import { CreateJobDialogComponent } from './_dialogs/jobs/create-job-dialog/create-job-dialog.component';
import { CreateTableDialogComponent } from './_dialogs/tables/create-table-dialog/create-table-dialog.component';
import { CreateScheduleDialogComponent } from './_dialogs/schedules/create-schedule-dialog/create-schedule-dialog.component';
import { EditScheduleDialogComponent } from './_dialogs/schedules/edit-schedule-dialog/edit-schedule-dialog.component';
import { HoursPipe } from './_pipes/hours.pipe';
import { PhoneNumberPipe } from './_pipes/phone-number.pipe';
import { CustomTimeFormatPipe }from './_pipes/custom-time-format.pipe';
import { PhoneNumberFormatDirective } from './_directives/phone-number.directive';
import { EmployeeScheduleDashboardComponent } from './employee-schedule-dashboard/employee-schedule-dashboard.component';
import { ProfileDashboardComponent } from './profile-dashboard/profile-dashboard.component';
import { TablesDashboardComponent } from './tables-dashboard/tables-dashboard.component';
import { TablesWaitlistComponent } from './tables-waitlist/tables-waitlist.component';
import { TablesAllTableViewComponent } from './tables-all-table-view/tables-all-table-view.component';
import { PunchClockDashboardComponent } from './punch-clock-dashboard/punch-clock-dashboard.component';
import { PunchClockBottomSheetComponent } from './_bottom-sheets/punch-clock/punch-clock-bottom-sheet/punch-clock-bottom-sheet.component';
import { ClockInTimePipe } from './_pipes/clock-in-time.pipe';
import { HeaderComponent } from './_shared/header/header.component';
import { CreateScheduleFromDateDialogComponent } from './_dialogs/schedules/create-schedule-from-date-dialog/create-schedule-from-date-dialog.component';
import { TablesEmployeeViewComponent } from './tables-employee-view/tables-employee-view.component';


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
        ScheduleDashboardComponent,
        CreateEmployeeDialogComponent,
        EditEmployeeDialogComponent,
        EditJobDialogComponent,
        EditTableDialogComponent,
        CreateJobDialogComponent,
        CreateTableDialogComponent,
        CreateScheduleDialogComponent,
        EditScheduleDialogComponent,
        HoursPipe,
        PhoneNumberPipe,
        CustomTimeFormatPipe,
        PhoneNumberFormatDirective,
        EmployeeScheduleDashboardComponent,
        ProfileDashboardComponent,
        TablesDashboardComponent,
        TablesWaitlistComponent,
        TablesAllTableViewComponent,
        PunchClockDashboardComponent,
        PunchClockBottomSheetComponent,
        ClockInTimePipe,
        HeaderComponent,
        CreateScheduleFromDateDialogComponent,
        TablesEmployeeViewComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase),  // imports firebase/app needed for everything,
        AngularFireStorageModule, //imports storage bin
        AngularFirestoreModule,  // imports firebase/firestore, only needed for database features
        AngularFireDatabaseModule,
        //Mat Components
        MatBottomSheetModule,
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
        DragDropModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
    ],
    providers: [DatePipe],
    bootstrap: [AppComponent]
})
export class AppModule { }
