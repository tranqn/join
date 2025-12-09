import { Routes } from '@angular/router';
import { Contact } from './pages/contact/contact';
import { Board } from './pages/board/board';
import { AddTask } from './pages/add-task/add-task';
import { Summary } from './pages/summary/summary';
import { PrivacyPolicy } from './imprint/privacy-policy/privacy-policy';
import { LegalNotice } from './imprint/legal-notice/legal-notice';

export const routes: Routes = [
	{
		path: 'contacts',
		component: Contact,
	},
	{
		path: 'board',
		component: Board,
	},
	{
		path: 'add-task',
		component: AddTask,
	},
	{
		path: '',
		component: Summary,
	},
	{
		path: 'privacy-policy',
		component: PrivacyPolicy
	},
	{
		path: 'legal-notice',
		component: LegalNotice
	}
];
