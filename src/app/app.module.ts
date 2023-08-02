import { NgModule, isDevMode } from '@angular/core';
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
import { HoursDashboardComponent } from './admin/hours-dashboard/hours-dashboard.component';
import { ProfileEditorComponent } from './admin/profile-editor/profile-editor.component';
import { CreateTimestampDialogComponent } from './_dialogs/hours/create-timestamp-dialog/create-timestamp-dialog.component';
import { EditTimestampDialogComponent } from './_dialogs/hours/edit-timestamp-dialog/edit-timestamp-dialog.component';
import { MassSelectDialogComponent } from './_dialogs/tables/mass-select-dialog/mass-select-dialog.component';
import { FloorAssignerComponent } from './admin/floor-assigner/floor-assigner.component';
import { ConfirmDialogComponent } from './_dialogs/confirm/confirm-dialog/confirm-dialog.component';
import { ServiceWorkerModule } from '@angular/service-worker';


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
        ConfirmDialogComponent,
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
        TablesEmployeeViewComponent,
        HoursDashboardComponent,
        ProfileEditorComponent,
        CreateTimestampDialogComponent,
        EditTimestampDialogComponent,
        MassSelectDialogComponent,
        FloorAssignerComponent
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
        ServiceWorkerModule.register('ngsw-worker.js', {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: 'registerWhenStable:30000'
        }),
    ],
    providers: [DatePipe],
    bootstrap: [AppComponent]
})
export class AppModule { }
