import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Guard that prevents access to routes for authenticated users.
 * Redirects to home page if user is already authenticated.
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns Observable that emits true if user is not authenticated, false otherwise
 */
export const guestGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.authReady$.pipe(
		map(() => {
			if (!authService.currentUser()) {
				return true;
			}
			router.navigate(['/']);
			return false;
		})
	);
};
