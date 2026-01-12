import { Injectable, inject, signal, Injector, runInInjectionContext } from '@angular/core';
import {
	Auth,
	signInWithEmailAndPassword,
	createUserWithEmailAndPassword,
	signOut,
	signInAnonymously,
	User,
	onAuthStateChanged,
	updateProfile
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { FirebaseService } from './firebase-service';
import { ColorService } from './color-service';
import { ContactModel } from '../interfaces/contact';
import { deleteUser } from '@angular/fire/auth';

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private auth = inject(Auth);
	private router = inject(Router);
	private firebaseService = inject(FirebaseService);
	private colorService = inject(ColorService);
	private injector = inject(Injector);

	currentUser = signal<User | null>(null);
	isLoading = signal(true);
	private authReadySubject = new ReplaySubject<void>(1);
	authReady$ = this.authReadySubject.asObservable();

	constructor() {
		onAuthStateChanged(this.auth, (user) => {
			runInInjectionContext(this.injector, () => {
				this.currentUser.set(user);
				if (this.isLoading()) {
					this.isLoading.set(false);
					this.authReadySubject.next();
					this.authReadySubject.complete();
				}
			});
		});
	}

	/**
	 * Registers a new user with email, password, and display name.
	 * Creates a user account and a corresponding contact entry.
	 * @param email - The user's email address
	 * @param password - The user's password
	 * @param displayName - The user's display name
	 * @returns Promise resolving to success status and user object or error message
	 */
	async register(email: string, password: string, displayName: string) {
		return runInInjectionContext(this.injector, async () => {
			try {
				const userCredential = await createUserWithEmailAndPassword(
					this.auth,
					email,
					password
				);
				if (userCredential.user) {
					await updateProfile(userCredential.user, { displayName });
					await this.createContactForUser(displayName, email);
				}
				return { success: true, user: userCredential.user };
			} catch (error: any) {
				return { success: false, error: this.getErrorMessage(error.code) };
			}
		});
	}

	/**
	 * Creates a contact entry in Firestore for the newly registered user.
	 * @param name - The user's display name
	 * @param email - The user's email address
	 */
	private async createContactForUser(name: string, email: string) {
		const contact: Omit<ContactModel, 'id'> = {
			name,
			email,
			phone: '',
			color: this.colorService.getRandomColor()
		};
		await this.firebaseService.addItemToCollection(contact, 'contacts');
	}

	/**
	 * Signs in a user with email and password.
	 * @param email - The user's email address
	 * @param password - The user's password
	 * @returns Promise resolving to success status and user object or error message
	 */
	async login(email: string, password: string) {
		return runInInjectionContext(this.injector, async () => {
			try {
				const userCredential = await signInWithEmailAndPassword(
					this.auth,
					email,
					password
				);
				return { success: true, user: userCredential.user };
			} catch (error: any) {
				return { success: false, error: this.getErrorMessage(error.code) };
			}
		});
	}

	/**
	 * Signs in a user anonymously as a guest.
	 * @returns Promise resolving to success status and user object or error message
	 */
	async loginAsGuest() {
		return runInInjectionContext(this.injector, async () => {
			try {
				const userCredential = await signInAnonymously(this.auth);
				return { success: true, user: userCredential.user };
			} catch (error: any) {
				return { success: false, error: this.getErrorMessage(error.code) };
			}
		});
	}

	/**
	 * Signs out the current user and navigates to the login page.
	 * @returns Promise resolving to success status or error message
	 */
	async logout() {
		return runInInjectionContext(this.injector, async () => {
			try {
				await signOut(this.auth);
				this.router.navigate(['/login']);
				return { success: true };
			} catch (error: any) {
				return { success: false, error: this.getErrorMessage(error.code) };
			}
		});
	}

	/**
	 * Deletes the currently authenticated user's account.
	 * @returns Promise resolving to success status or error message
	 */
	async deleteAccount() {
		return runInInjectionContext(this.injector, async () => {
			const user = this.auth.currentUser;
			if (user) {
				try {
					await deleteUser(user);
					return { succes: true };
				} catch (error: any) {
					return { succes: false, error: this.getErrorMessage(error.code) };
				}
			}
			return { succes: false, error: 'No user logged in' };
		});
	}

	/**
	 * Converts Firebase auth error codes to user-friendly error messages.
	 * @param code - The Firebase auth error code
	 * @returns A user-friendly error message
	 */
	private getErrorMessage(code: string): string {
		switch (code) {
			case 'auth/email-already-in-use':
				return 'This email is already registered.';
			case 'auth/invalid-email':
				return 'Invalid email address.';
			case 'auth/operation-not-allowed':
				return 'Operation not allowed.';
			case 'auth/weak-password':
				return 'Password is too weak. Use at least 6 characters.';
			case 'auth/user-disabled':
				return 'This account has been disabled.';
			case 'auth/user-not-found':
				return 'No account found with this email.';
			case 'auth/wrong-password':
				return 'Incorrect password.';
			case 'auth/invalid-credential':
				return 'Invalid email or password.';
			default:
				return 'An error occurred. Please try again.';
		}
	}
}
