import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './guard/auth/auth.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { PaymentComponent } from './payment/payment.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { WalletComponent } from './wallet/wallet.component';
import { ReferralComponent } from './referral/referral.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'home', component: HomeComponent},
      { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
      { path: 'transaction', component: TransactionsComponent, canActivate: [authGuard] },
      { path: 'wallet', component: WalletComponent, canActivate: [authGuard] },
      { path: 'referral', component: ReferralComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] }
      // add more like hotels, about, contact etc here
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
