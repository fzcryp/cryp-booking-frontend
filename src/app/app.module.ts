import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SubscribersAdminComponent } from './admin/subscribers-admin/subscribers-admin.component';
import { ContactRequestsAdminComponent } from './admin/contact-requests-admin/contact-requests-admin.component'; // Added
import { AdminAffiliatePartnerComponent } from './admin/admin-affiliate-partner/admin-affiliate-partner.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { HomeComponent } from './home/home.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LandingV2Component } from './landing-page/landing-v2/landing-v2.component';
import { LandingV3Component } from './landing-page/landing-v3/landing-v3.component';
import { LandingV4Component } from './landing-page/landing-v4/landing-v4.component';
import { LandingSimpleComponent } from './landing-page/landing-simple/landing-simple.component';
import { LandingCenterComponent } from './landing-page/landing-center/landing-center.component';
import { DiscountComponent } from './discount/discount.component';
import { HeaderComponent } from './header/header.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { PaymentComponent } from './payment/payment.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { FooterComponent } from './footer/footer.component';
import { WalletComponent } from './wallet/wallet.component';
import { ReferralComponent } from './referral/referral.component';
import { ProfileComponent } from './profile/profile.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { DiscountRequestAdminComponent } from './admin/discount-request-admin/discount-request-admin.component';
import { SupportComponent } from './support/support.component';
import { SupportAdminComponent } from './admin/support-admin/support-admin.component';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { FlightComponent } from './flight/flight.component';
import { CarComponent } from './car/car.component';
import { HotelsComponent } from './hotels/hotels.component';
import { AmadeusComponent } from './Services/amadeus/amadeus.component';
import { MyHotelsComponent } from './my-hotels/my-hotels.component';
import { FaqComponent } from './faq/faq.component';
import { ContactUsComponent } from './contact-us/contact-us.component'; // Added
import { TermsComponent } from './terms/terms.component'; // Added

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    SignupComponent,
    SigninComponent,
    HomeComponent,
    LandingPageComponent,
    LandingV2Component,
    LandingV3Component,
    LandingV4Component,
    LandingSimpleComponent,
    LandingCenterComponent,
    HeaderComponent,
    MainLayoutComponent,
    AuthLayoutComponent,
    PaymentComponent,
    TransactionsComponent,
    FooterComponent,
    WalletComponent,
    ReferralComponent,
    ProfileComponent,
    MaintenanceComponent,
    DiscountRequestAdminComponent,
    SupportComponent,
    SupportAdminComponent,
    FlightComponent, // Added
    CarComponent,    // Added
    SubscribersAdminComponent,
    AdminAffiliatePartnerComponent,
    HotelsComponent,
    AmadeusComponent,
    AmadeusComponent,
    MyHotelsComponent,
    FaqComponent,
    ContactUsComponent,
    ContactRequestsAdminComponent,
    TermsComponent // Added
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    DragDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
