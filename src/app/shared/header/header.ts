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

	async logout() {
		await this.authService.logout();
	}

	getUserName(): string {
		const user = this.authService.currentUser();
		if (!user) return 'Guest';
		return user.isAnonymous ? 'Guest' : (user.displayName || 'User');
	}

	getInitials(): string {
		const name = this.getUserName();
		if (name === 'Guest') return 'G';
		return getShortName(name);
	}

	toggleDropdown(event: Event) {
		event.stopPropagation();
		this.isDropdownOpen.update(v => !v);
	}

	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.user-menu')) {
			this.isDropdownOpen.set(false);
		}
	}
}
