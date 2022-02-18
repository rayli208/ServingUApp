import { TimesheetDashboardComponent } from './timesheet-dashboard/timesheet-dashboard.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//User components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HiringDashboardComponent } from './hiring-dashboard/dashboard.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

//Job Components
import { CreateJobComponent } from './create-job/create-job.component';
import { EditJobComponent } from './edit-job/edit-job.component';

import { AuthGuard } from './_guards/auth.guard';


const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    //User components
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    { path: 'hiring-dashboard', component: HiringDashboardComponent, canActivate: [AuthGuard] },
    { path: 'employee-dashboard', component: EmployeeDashboardComponent, canActivate: [AuthGuard] },
    { path: 'timesheet-dashboard', component: TimesheetDashboardComponent, canActivate: [AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    //Job Components
    { path: 'create', component: CreateJobComponent, canActivate: [AuthGuard] },
    { path: 'update-job/:id', component: EditJobComponent, canActivate: [AuthGuard] },
    //Random
    { path: '**', component: PageNotFoundComponent },                       // catch-all in case no other path matched
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
