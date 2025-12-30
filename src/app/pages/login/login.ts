import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SplashService } from '../../services/splash.service';
import { Icon } from '../../shared/icon/icon';

@Component({
	selector: 'app-login',
	imports: [ReactiveFormsModule, RouterLink, Icon],
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

	loginForm = this.fb.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]]
	});

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

	togglePasswordVisibility() {
		this.showPassword.update(v => !v);
	}

	get emailControl() {
		return this.loginForm.get('email');
	}

	get passwordControl() {
		return this.loginForm.get('password');
	}
}
