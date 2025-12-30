import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';
import { MobileGreetingOverlay } from '../mobile-greeting-overlay/mobile-greeting-overlay';

@Component({
	selector: 'app-layout',
	imports: [RouterOutlet, Header, Navbar, MobileGreetingOverlay],
	template: `
		<app-navbar></app-navbar>
		<app-header></app-header>
		<app-mobile-greeting-overlay></app-mobile-greeting-overlay>
		<main class="main-content">
			<router-outlet />
		</main>
	`,
	styles: [`
		.main-content {
			margin-left: 240px;
			max-width: 1200px;
			@media (max-width: 768px) {
				margin-left: 0;
			}
		}
	`]
})
export class Layout {}
