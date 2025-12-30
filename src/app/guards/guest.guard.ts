import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

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
