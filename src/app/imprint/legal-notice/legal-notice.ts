import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-legal-notice',
  imports: [],
  templateUrl: './legal-notice.html',
  styleUrl: './legal-notice.scss',
})
export class LegalNotice {
  constructor(private location: Location) {}

  /**
   * Navigates back to the previous page in the browser history.
   */
  goBack(): void {
    this.location.back();
  }
}
