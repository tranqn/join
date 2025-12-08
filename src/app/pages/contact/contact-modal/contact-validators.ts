import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator for minimum length
 * @param minLength Minimum number of characters required
 * @returns Validator function
 */
export function minLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return { required: true };
    }
    if (control.value.length < minLength) {
      return { minLength: { requiredLength: minLength, actualLength: control.value.length } };
    }
    return null;
  };
}


/**
 * Custom validator for email format
 * @returns Validator function
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return { required: true };
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(control.value)) {
      return { email: true };
    }
    return null;
  };
}


/**
 * Custom validator for phone format (optional field)
 * @returns Validator function or null if empty
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const phonePattern = /^[+]?[\d\s\-()]+$/;
    if (!phonePattern.test(control.value)) {
      return { phone: true };
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
    return `${controlName} must be at least ${errors['minLength'].requiredLength} characters`;
  }

  if (errors['email']) {
    return 'Please enter a valid email address';
  }

  if (errors['phone']) {
    return 'Please enter a valid phone number';
  }

  return 'Invalid value';
}
