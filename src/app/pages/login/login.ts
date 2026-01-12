import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SplashService } from '../../services/splash.service';
import { Icon } from '../../shared/icon/icon';
import { SplashScreen } from '../../shared/splash-screen/splash-screen';

@Component({
	selector: 'app-login',
	imports: [ReactiveFormsModule, RouterLink, Icon, SplashScreen],
	templateUrl: './login.html',
	styleUrl: './login.scss'
})
export class Login {
	private authService = inject(AuthService);
	private router = inject(Router);
	private fb = inject(FormBuilder);
	private splashService = inject(SplashService);

	isLoading = signal(false);
	errorMessage = signal('');
	showPassword = signal(false);
	showLogo = this.splashService.splashComplete;
	inputIsClicked = signal(false);

	loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]]
	});

	/**
	 * Handles form submission for user login.
	 * Validates the form and attempts to authenticate the user.
	 */
	async onSubmit() {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		this.errorMessage.set('');

		const { email, password } = this.loginForm.value;
		const result = await this.authService.login(email!, password!);

		this.isLoading.set(false);

		if (result.success) {
			sessionStorage.setItem('showGreeting', 'true');
			this.router.navigate(['/']);
		} else {
			this.errorMessage.set(result.error || 'Login failed');
		}
	}

	/**
	 * Handles guest login without requiring credentials.
	 */
	async onGuestLogin() {
		this.isLoading.set(true);
		this.errorMessage.set('');

		const result = await this.authService.loginAsGuest();

		this.isLoading.set(false);

		if (result.success) {
			sessionStorage.setItem('showGreeting', 'true');
			this.router.navigate(['/']);
		} else {
			this.errorMessage.set(result.error || 'Guest login failed');
		}
	}

	/**
	 * Toggles the visibility of the password field.
	 */
	togglePasswordVisibility() {
		this.showPassword.update(v => !v);
	}

	/**
	 * Gets the email form control.
	 * @returns The email form control
	 */
	get emailControl() {
		return this.loginForm.get('email');
	}

	/**
	 * Gets the password form control.
	 * @returns The password form control
	 */
	get passwordControl() {
		return this.loginForm.get('password');
	}

	/**
	 * Sets the inputIsClicked signal to true.
	 */
	SetInputisClickedTrue() {
		this.inputIsClicked.set(true);
	}
}
