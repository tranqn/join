import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator for minimum length with trimmed value
 * @param minLength Minimum number of characters required
 * @returns Validator function
 */
export function minLengthValidator(minLength: number): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		const value = control.value?.trim() || '';
		if (!value) {
			return { required: true };
		}
		if (value.length < minLength) {
			return { minLength: { requiredLength: minLength, actualLength: value.length } };
		}
		return null;
	};
}

/**
 * Custom validator that ensures the date is not in the past
 * @returns Validator function
 */
export function noPastDateValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		if (!control.value) {
			return { required: true };
		}
		
		const selectedDate = new Date(control.value);
		const today = new Date();
		
		// Create UTC midnight for comparison
		const selectedUtc = Date.UTC(selectedDate.getUTCFullYear(), selectedDate.getUTCMonth(), selectedDate.getUTCDate());
		const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
		
		if (selectedUtc < todayUtc) {
			return { pastDate: true };
		}
		return null;
	};
}

/**
 * Custom validator for required selection
 * @returns Validator function
 */
export function requiredValidator(): ValidatorFn {
	return (control: AbstractControl): ValidationErrors | null => {
		if (!control.value || control.value === '') {
			return { required: true };
		}
		return null;
	};
}

/**
 * Get error message for a form control
 * @param controlName Name of the control
 * @param errors Validation errors object
 * @returns User-friendly error message
 */
export function getErrorMessage(controlName: string, errors: ValidationErrors | null): string {
	if (!errors) {
		return '';
	}
	if (errors['required']) {
		return `${controlName} is required`;
	}
	if (errors['minLength']) {
		const required = errors['minLength'].requiredLength;
		return `${controlName} must be at least ${required} characters`;
	}
	if (errors['pastDate']) {
		return 'Date cannot be in the past';
	}
	return 'Invalid value';
}
