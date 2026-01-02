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
		canActivate: [guestGuard],
		
	},
	{
		path: 'register',
		component: Register,
		canActivate: [guestGuard],
		
	},
	{
		path: '',
		component: Layout,
		children: [
			{
				path: '',
				component: Summary,
				canActivate: [authGuard]
			},
			{
				path: 'contacts',
				component: Contact,
				canActivate: [authGuard]
			},
			{
				path: 'board',
				component: Board,
				canActivate: [authGuard]
			},
			{
				path: 'add-task',
				component: AddTask,
				canActivate: [authGuard]
			},
			{
				path: 'help',
				component: Help,
				canActivate: [authGuard]
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
