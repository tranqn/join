import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  constructor(private location: Location) {}

  /**
   * Navigates back to the previous page in the browser history.
   */
  goBack(): void {
    this.location.back();
  }
}
