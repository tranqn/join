import { Routes } from '@angular/router';
import { Contact } from './pages/contact/contact';
import { Board } from './pages/board/board';
import { AddTask } from './pages/add-task/add-task';
import { Summary } from './pages/summary/summary';
import { PrivacyPolicy } from './imprint/privacy-policy/privacy-policy';
import { LegalNotice } from './imprint/legal-notice/legal-notice';
import { Help } from './shared/help/help';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Layout } from './shared/layout/layout';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
	{
		path: 'login',
		component: Login,
		canActivate: [guestGuard]
	},
	{
		path: 'register',
		component: Register,
		canActivate: [guestGuard]
	},
	{
		path: '',
		component: Layout,
		canActivate: [authGuard],
		children: [
			{
				path: '',
				component: Summary
			},
			{
				path: 'contacts',
				component: Contact
			},
			{
				path: 'board',
				component: Board
			},
			{
				path: 'add-task',
				component: AddTask
			},
			{
				path: 'help',
				component: Help
			},
			{
				path: 'privacy-policy',
				component: PrivacyPolicy
			},
			{
				path: 'legal-notice',
				component: LegalNotice
			}
		]
	},
];
