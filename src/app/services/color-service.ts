import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ColorService {
	profilColors = [
		'#2563EB',
		'#9333EA',
		'#10B981',
		'#F97316',
		'#EC4899',
		'#14B8A6',
		'#1F2937',
		'#6B7280',
		'#B45309',
		'#D97706',
		'#EF4444',
		'#06B6D4',
		'#6366F1',
		'#4D7C0F',
		'#F43F5E'
	];

	/**
	 * Selects and returns a random color from the predefined color palette.
	 * @returns A hex color string
	 */
	getRandomColor(): string {
		return this.profilColors[Math.floor(Math.random() * this.profilColors.length)];
	}
}
