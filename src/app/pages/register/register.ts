import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Icon } from '../../shared/icon/icon';
import { MessageService } from 'primeng/api';

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
	private messageService = inject(MessageService)

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

	/**
	 * Validates password strength (requires uppercase, number, and special character).
	 * @param control - The form control to validate
	 * @returns Validation errors or null if valid
	 */
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

	/**
	 * Validates that password and confirm password fields match.
	 * @param control - The form group to validate
	 * @returns Validation errors or null if passwords match
	 */
	passwordMatchValidator(control: AbstractControl) {
		const password = control.get('password');
		const confirmPassword = control.get('confirmPassword');

		if (!password || !confirmPassword) {
			return null;
		}

		return password.value === confirmPassword.value ? null : { passwordMismatch: true };
	}

	/**
	 * Handles form submission for user registration.
	 * Validates the form and attempts to create a new user account.
	 */
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
			this.messageService.add({
				severity: 'success',
				summary: 'Success',
				detail: 'Registration successful',
				life: 3000
			});
			await this.authService.logout();
			sessionStorage.setItem('showGreeting', 'true');
			this.router.navigate(['/login']);
		} else {
			this.errorMessage.set(result.error || 'Registration failed');
		}
	}

	/**
	 * Toggles the visibility of the password field.
	 */
	togglePasswordVisibility() {
		this.showPassword.update(v => !v);
	}

	/**
	 * Toggles the visibility of the confirm password field.
	 */
	toggleConfirmPasswordVisibility() {
		this.showConfirmPassword.update(v => !v);
	}

	/**
	 * Gets the name form control.
	 * @returns The name form control
	 */
	get nameControl() {
		return this.registerForm.get('name');
	}

	/**
	 * Gets the email form control.
	 * @returns The email form control
	 */
	get emailControl() {
		return this.registerForm.get('email');
	}

	/**
	 * Gets the password form control.
	 * @returns The password form control
	 */
	get passwordControl() {
		return this.registerForm.get('password');
	}

	/**
	 * Gets the confirm password form control.
	 * @returns The confirm password form control
	 */
	get confirmPasswordControl() {
		return this.registerForm.get('confirmPassword');
	}

	/**
	 * Gets the accept policy form control.
	 * @returns The accept policy form control
	 */
	get acceptPolicyControl() {
		return this.registerForm.get('acceptPolicy');
	}
}
