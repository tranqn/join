import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../services/auth.service';
import { getShortName } from '../../pages/contact/contact';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class Header {
	router = inject(Router);
	authService = inject(AuthService);
	isDropdownOpen = signal(false);

	/**
	 * Checks if the current route is the help page.
	 * @returns True if on the help route, false otherwise
	 */
	isHelpRoute(): boolean {
		return this.router.url === '/help';
	}

	/**
	 * Logs out the current user.
	 */
	async logout() {
		await this.authService.logout();
	}

	/**
	 * Gets the display name of the current user.
	 * @returns The user's display name or 'Guest'
	 */
	getUserName(): string {
		const user = this.authService.currentUser();
		if (!user) return 'Guest';
		return user.isAnonymous ? 'Guest' : (user.displayName || 'User');
	}

	/**
	 * Gets the initials of the current user.
	 * @returns The user's initials
	 */
	getInitials(): string {
		const name = this.getUserName();
		if (name === 'Guest') return 'G';
		return getShortName(name);
	}

	/**
	 * Toggles the user menu dropdown visibility.
	 * @param event - The click event
	 */
	toggleDropdown(event: Event) {
		event.stopPropagation();
		this.isDropdownOpen.update(v => !v);
	}

	/**
	 * Closes the dropdown when clicking outside the menu.
	 * @param event - The mouse click event
	 */
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-menu')) {
			this.isDropdownOpen.set(false);
		}
	}
}
