import { TablesDashboardComponent } from './tables-dashboard/tables-dashboard.component';
import { ProfileDashboardComponent } from './profile-dashboard/profile-dashboard.component';
import { EmployeeScheduleDashboardComponent } from './employee-schedule-dashboard/employee-schedule-dashboard.component';
import { ScheduleDashboardComponent } from './schedule-dashboard/schedule-dashboard.component';
import { PunchClockDashboardComponent } from './punch-clock-dashboard/punch-clock-dashboard.component';
import { EmployeeDashboardComponent } from './employee-dashboard/employee-dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//User components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { HiringDashboardComponent } from './hiring-dashboard/hiring-dashboard.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AuthGuard } from './_guards/auth.guard';


const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    //User components
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    { path: 'hiring-dashboard', component: HiringDashboardComponent, canActivate: [AuthGuard] },
    { path: 'employee-dashboard', component: EmployeeDashboardComponent, canActivate: [AuthGuard] },
    { path: 'schedule-dashboard', component: ScheduleDashboardComponent, canActivate: [AuthGuard] },
    { path: 'punch-clock-dashboard', component: PunchClockDashboardComponent, canActivate: [AuthGuard] },
    { path: 'tables-dashboard', component: TablesDashboardComponent, canActivate: [AuthGuard] },
    { path: 'profile-dashboard', component: ProfileDashboardComponent, canActivate: [AuthGuard] },
    { path: 'employee-schedule-dashboard/:id', component: EmployeeScheduleDashboardComponent, canActivate: [AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    //Random
    { path: '**', component: PageNotFoundComponent },                       // catch-all in case no other path matched
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
