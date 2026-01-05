import { Injectable, inject, signal } from '@angular/core';
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

@Injectable({
	providedIn: 'root'
})
export class AuthService {
	private auth = inject(Auth);
	private router = inject(Router);
	private firebaseService = inject(FirebaseService);
	private colorService = inject(ColorService);

	currentUser = signal<User | null>(null);
	isLoading = signal(true);
	private authReadySubject = new ReplaySubject<void>(1);
	authReady$ = this.authReadySubject.asObservable();

	constructor() {
		onAuthStateChanged(this.auth, (user) => {
			this.currentUser.set(user);
			if (this.isLoading()) {
				this.isLoading.set(false);
				this.authReadySubject.next();
				this.authReadySubject.complete();
			}
		});
	}

	async register(email: string, password: string, displayName: string) {
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
	}

	private async createContactForUser(name: string, email: string) {
		const contact: Omit<ContactModel, 'id'> = {
			name,
			email,
			phone: '',
			color: this.colorService.getRandomColor()
		};
		await this.firebaseService.addItemToCollection(contact, 'contacts');
	}

	async login(email: string, password: string) {
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
	}

	async loginAsGuest() {
		try {
			const userCredential = await signInAnonymously(this.auth);
			return { success: true, user: userCredential.user };
		} catch (error: any) {
			return { success: false, error: this.getErrorMessage(error.code) };
		}
	}

	async logout() {
		try {
			await signOut(this.auth);
			this.router.navigate(['/login']);
			return { success: true };
		} catch (error: any) {
			return { success: false, error: this.getErrorMessage(error.code) };
		}
	}

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
