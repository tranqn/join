import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
	router = inject(Router);

	/**
	 * Checks if the current route is the help page.
	 * @returns True if on the help route, false otherwise
	 */
	isHelpRoute(): boolean {
		return this.router.url === '/help';
	}
}
