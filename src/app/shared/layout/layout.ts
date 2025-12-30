import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Navbar } from '../navbar/navbar';

@Component({
	selector: 'app-layout',
	imports: [RouterOutlet, Header, Navbar],
	template: `
		<app-navbar></app-navbar>
		<app-header></app-header>
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
