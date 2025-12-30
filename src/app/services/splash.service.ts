import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SplashService {
	splashComplete = signal(false);

	markSplashComplete() {
		this.splashComplete.set(true);
	}
}
