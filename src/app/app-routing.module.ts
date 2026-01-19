import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './guard/auth/auth.guard';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LandingV2Component } from './landing-page/landing-v2/landing-v2.component';
import { LandingV3Component } from './landing-page/landing-v3/landing-v3.component';
import { LandingV4Component } from './landing-page/landing-v4/landing-v4.component';
import { LandingSimpleComponent } from './landing-page/landing-simple/landing-simple.component';
import { LandingCenterComponent } from './landing-page/landing-center/landing-center.component';
import { DiscountComponent } from './discount/discount.component';
import { AdminComponent } from './admin/admin.component';
import { DiscountRequestAdminComponent } from './admin/discount-request-admin/discount-request-admin.component';
import { UserListAdminComponent } from './admin/user-list-admin/user-list-admin.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { PaymentComponent } from './payment/payment.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { WalletComponent } from './wallet/wallet.component';
import { ReferralComponent } from './referral/referral.component';
import { ProfileComponent } from './profile/profile.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { SupportComponent } from './support/support.component';
import { SupportAdminComponent } from './admin/support-admin/support-admin.component';
import { SubscribersAdminComponent } from './admin/subscribers-admin/subscribers-admin.component';
import { ContactRequestsAdminComponent } from './admin/contact-requests-admin/contact-requests-admin.component'; // Added
import { AdminAffiliatePartnerComponent } from './admin/admin-affiliate-partner/admin-affiliate-partner.component';
import { FlightComponent } from './flight/flight.component';
import { CarComponent } from './car/car.component';
import { HotelsComponent } from './hotels/hotels.component';
import { MyHotelsComponent } from './my-hotels/my-hotels.component';
import { FaqComponent } from './faq/faq.component';
import { ContactUsComponent } from './contact-us/contact-us.component'; // Import Contact Us
import { TermsComponent } from './terms/terms.component';

const routes: Routes = [
  // { path: '', component: MaintenanceComponent, },
  // { path: 'contact-us', component: ContactUsComponent }, // Add Route
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: LandingPageComponent },
      { path: 'landing-page', component: LandingPageComponent },
      { path: 'design2', component: LandingV2Component },
      { path: 'design3', component: LandingV3Component },
      { path: 'design4', component: LandingV4Component },
      { path: 'design4', component: LandingV4Component },
      { path: 'Bookings', component: LandingSimpleComponent },
      { path: 'design-center', component: HotelsComponent, canActivate: [authGuard] }, // Updated to HotelsComponent
      { path: 'hotels', component: HotelsComponent, canActivate: [authGuard] },        // Updated to HotelsComponent
      { path: 'get-discount', component: DiscountComponent, canActivate: [authGuard] },
      { path: 'admin', component: AdminComponent }, // Admin route
      { path: 'admin/discount-requests', component: DiscountRequestAdminComponent },
      { path: 'admin/users', component: UserListAdminComponent },
      { path: 'admin/subscribers', component: SubscribersAdminComponent },
      { path: 'admin/contact-requests', component: ContactRequestsAdminComponent }, // Added
      { path: 'home', component: HomeComponent },
      { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },
      { path: 'transaction', component: TransactionsComponent, canActivate: [authGuard] },
      { path: 'wallet', component: WalletComponent, canActivate: [authGuard] },
      { path: 'referral', component: ReferralComponent, canActivate: [authGuard] },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
      { path: 'maintenance', component: MaintenanceComponent, canActivate: [authGuard] },
      { path: 'support', component: SupportComponent, canActivate: [authGuard] },
      { path: 'admin/support', component: SupportAdminComponent, canActivate: [authGuard] },
      { path: 'admin/affiliate-partners', component: AdminAffiliatePartnerComponent, canActivate: [authGuard] },
      { path: 'flights', component: FlightComponent, canActivate: [authGuard] }, // Added
      { path: 'cars', component: CarComponent, canActivate: [authGuard] },       // Added
      { path: 'landing-center', component: LandingCenterComponent, canActivate: [authGuard] },
      { path: 'Favorites', component: MyHotelsComponent, canActivate: [authGuard] },
      { path: 'faq', component: FaqComponent, canActivate: [authGuard] },
      { path: 'contact-us', component: ContactUsComponent, canActivate: [authGuard] }, // Add Route
      { path: 'terms-and-conditions', component: TermsComponent, canActivate: [authGuard] }, // Add Route
      // add more like hotels, about, contact etc here
    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'signin', component: SigninComponent },
      { path: 'signup', component: SignupComponent },
    ]
  },
  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
