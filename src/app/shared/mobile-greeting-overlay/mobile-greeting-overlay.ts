import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-mobile-greeting-overlay',
	imports: [],
	templateUrl: './mobile-greeting-overlay.html',
	styleUrl: './mobile-greeting-overlay.scss'
})
export class MobileGreetingOverlay {
	authService = inject(AuthService);
	showGreeting = signal(sessionStorage.getItem('showGreeting') === 'true');
	isFadingOut = signal(false);

	constructor() {
		// If greeting should be shown, remove flag and set timer to hide
		if (this.showGreeting()) {
			sessionStorage.removeItem('showGreeting');
			// Start fade-out after 1.7 seconds, then hide after animation completes
			setTimeout(() => {
				this.isFadingOut.set(true);
			}, 1700);
			setTimeout(() => {
				this.showGreeting.set(false);
			}, 2000);
		}
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
	 * Gets a time-appropriate greeting message.
	 * @returns A greeting message based on the time of day
	 */
	getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 18) return 'Good afternoon';
		return 'Good evening';
	}
}
