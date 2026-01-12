import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

/**
 * Guard that prevents access to routes for unauthenticated users.
 * Redirects to login page if user is not authenticated.
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns Observable that emits true if user is authenticated, false otherwise
 */
export const authGuard: CanActivateFn = (route, state) => {
	const authService = inject(AuthService);
	const router = inject(Router);

	return authService.authReady$.pipe(
		map(() => {
			if (authService.currentUser()) {
				return true;
			}
			router.navigate(['/login']);
			return false;
		})
	);
};
