import { Component, input, output, signal, HostListener } from '@angular/core';

@Component({
	selector: 'app-date-picker',
	imports: [],
	templateUrl: './date-picker.html',
	styleUrl: './date-picker.scss',
})
export class DatePicker {
	selectedDate = input<number | string | null>(null);
	isInvalid = input<boolean>(false);
	dateSelected = output<number>();

	isOpen = signal(false);
	viewDate = new Date();

	weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

	/**
	 * Toggles the date picker visibility.
	 */
	toggle() {
		this.isOpen.update(open => !open);
	}

	/**
	 * Formats a timestamp to a date string (dd/mm/yyyy).
	 * @param value - The timestamp or date string to format
	 * @returns The formatted date string
	 */
	formatDate(value: number | string | null): string {
		if (!value) return 'dd/mm/yyyy';
		const date = new Date(value);
		const day = String(date.getUTCDate()).padStart(2, '0');
		const month = String(date.getUTCMonth() + 1).padStart(2, '0');
		const year = date.getUTCFullYear();
		return `${day}/${month}/${year}`;
	}

	/**
	 * Gets the current month and year for display.
	 * @returns The month and year string (e.g., "January 2026")
	 */
	getMonthYear(): string {
		const months = ['January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'];
		return `${months[this.viewDate.getMonth()]} ${this.viewDate.getFullYear()}`;
	}

	/**
	 * Navigates to the previous month.
	 */
	prevMonth() {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
	}

	/**
	 * Navigates to the next month.
	 */
	nextMonth() {
		this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
	}

	/**
	 * Generates an array of calendar days for the current view month.
	 * @returns Array of calendar day objects with metadata
	 */
	getCalendarDays(): { num: number; date: Date; current: boolean; selected: boolean; today: boolean; past: boolean }[] {
		const days = [];
		const year = this.viewDate.getFullYear();
		const month = this.viewDate.getMonth();
		const firstDay = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const daysInPrevMonth = new Date(year, month, 0).getDate();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const selectedValue = this.selectedDate();

		// Previous month days
		for (let i = firstDay - 1; i >= 0; i--) {
			const date = new Date(year, month - 1, daysInPrevMonth - i);
			days.push({ num: daysInPrevMonth - i, date, current: false, selected: false, today: false, past: date < today });
		}

		// Current month days
		for (let i = 1; i <= daysInMonth; i++) {
			const date = new Date(year, month, i);
			const isToday = date.getTime() === today.getTime();

			let isSelected = false;
			if (selectedValue) {
				const selDate = new Date(selectedValue);
				isSelected = selDate.getUTCFullYear() === year &&
					selDate.getUTCMonth() === month &&
					selDate.getUTCDate() === i;
			}

			days.push({ num: i, date, current: true, selected: isSelected, today: isToday, past: date < today });
		}

		// Next month days
		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const date = new Date(year, month + 1, i);
			days.push({ num: i, date, current: false, selected: false, today: false, past: false });
		}

		return days;
	}

	/**
	 * Selects a date and emits the UTC timestamp.
	 * @param date - The selected date
	 */
	selectDate(date: Date) {
		const utcTimestamp = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
		this.dateSelected.emit(utcTimestamp);
		this.isOpen.set(false);
	}

	/**
	 * Closes the date picker when clicking outside.
	 * @param event - The mouse click event
	 */
	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.date-picker')) {
			this.isOpen.set(false);
		}
	}
}
