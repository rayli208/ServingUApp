import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//User components
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

//Job Components
import { CreateJobComponent } from './create-job/create-job.component';
import { ListJobsComponent } from './list-jobs/list-jobs.component';
import { EditJobComponent } from './edit-job/edit-job.component';

import { AuthGuard } from './guards/auth.guard';


const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    //User components
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    //Job Components
    { path: 'create', component: CreateJobComponent, canActivate: [AuthGuard] },
    // { path: 'list-jobs', component: ListJobsComponent, canActivate: [AuthGuard] },
    { path: 'update-job/:id', component: EditJobComponent, canActivate: [AuthGuard] },
    //Random
    { path: '**', component: HomeComponent },                       // catch-all in case no other path matched
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
