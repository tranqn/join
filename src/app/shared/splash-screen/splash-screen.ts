import { Component, signal, inject } from '@angular/core';
import { SplashService } from '../../services/splash.service';

@Component({
	selector: 'app-splash-screen',
	imports: [],
	templateUrl: './splash-screen.html',
	styleUrl: './splash-screen.scss'
})
export class SplashScreen {
	private splashService = inject(SplashService);
	showSplash = signal(true);
	isAnimating = signal(false);

	constructor() {
		// Always show splash for now (remove sessionStorage check for testing)
		// Start animation after a brief delay
		setTimeout(() => {
			this.isAnimating.set(true);
		}, 1000);

		// Mark splash complete BEFORE hiding it, so login logo appears first
		setTimeout(() => {
			this.splashService.markSplashComplete();
		}, 2050);

		// Hide splash after login logo is visible
		setTimeout(() => {
			this.showSplash.set(false);
		}, 2300);
	}
}
