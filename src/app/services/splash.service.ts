import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SplashService {
	splashComplete = signal(false);

	/**
	 * Marks the splash screen animation as complete.
	 */
	markSplashComplete() {
		this.splashComplete.set(true);
	}
}
