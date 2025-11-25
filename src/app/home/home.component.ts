import { Component } from '@angular/core';
import { AuthService } from '../Services/auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
  searchHotels() {
  const locationInput = (document.querySelector('.search-box input[type="text"]') as HTMLInputElement).value;
  const checkIn = (document.querySelectorAll('.search-box input[type="date"]')[0] as HTMLInputElement).value;
  const checkOut = (document.querySelectorAll('.search-box input[type="date"]')[1] as HTMLInputElement).value;

  if (!locationInput || !checkIn || !checkOut) {
    alert("Please enter all fields");
    return;
  }

  // Convert the location string to Travala format (replace spaces with -)
  const formattedLocation = encodeURIComponent(locationInput.trim());

  // Build URL
  const url = `https://www.travala.com/search?check_in=${checkIn}&check_out=${checkOut}&location=${formattedLocation}&place_types=multi_region&r1=2`;

  // Redirect
  window.location.href = url;
}

}
