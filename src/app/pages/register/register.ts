import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Icon } from '../../shared/icon/icon';

@Component({
	selector: 'app-register',
	imports: [ReactiveFormsModule, RouterLink, Icon],
	templateUrl: './register.html',
	styleUrl: './register.scss'
})
export class Register {
	private authService = inject(AuthService);
	private router = inject(Router);
	private fb = inject(FormBuilder);

	isLoading = signal(false);
	errorMessage = signal('');
	showPassword = signal(false);
	showConfirmPassword = signal(false);

	registerForm = this.fb.group({
		name: ['', [Validators.required, Validators.minLength(2)]],
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6), this.passwordStrengthValidator]],
		confirmPassword: ['', [Validators.required]],
		acceptPolicy: [false, [Validators.requiredTrue]]
	}, {
		validators: this.passwordMatchValidator
	});

	passwordStrengthValidator(control: AbstractControl) {
		const value = control.value;
		
		if (!value) {
			return null;
		}

		const hasUpperCase = /[A-Z]/.test(value);
		const hasNumber = /[0-9]/.test(value);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

		const passwordValid = hasUpperCase && hasNumber && hasSpecialChar;

		return !passwordValid ? { passwordStrength: true } : null;
	}

	passwordMatchValidator(control: AbstractControl) {
		const password = control.get('password');
		const confirmPassword = control.get('confirmPassword');

		if (!password || !confirmPassword) {
			return null;
		}

		return password.value === confirmPassword.value ? null : { passwordMismatch: true };
	}

	async onSubmit() {
		if (this.registerForm.invalid) {
			this.registerForm.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		this.errorMessage.set('');

		const { name, email, password } = this.registerForm.value;
		const result = await this.authService.register(email!, password!, name!);

		this.isLoading.set(false);

		if (result.success) {
			await this.authService.logout();
			sessionStorage.setItem('showGreeting', 'true');
			this.router.navigate(['/login']);
		} else {
			this.errorMessage.set(result.error || 'Registration failed');
		}
	}

	togglePasswordVisibility() {
		this.showPassword.update(v => !v);
	}

	toggleConfirmPasswordVisibility() {
		this.showConfirmPassword.update(v => !v);
	}

	get nameControl() {
		return this.registerForm.get('name');
	}

	get emailControl() {
		return this.registerForm.get('email');
	}

	get passwordControl() {
		return this.registerForm.get('password');
	}

	get confirmPasswordControl() {
		return this.registerForm.get('confirmPassword');
	}

	get acceptPolicyControl() {
		return this.registerForm.get('acceptPolicy');
	}
}
