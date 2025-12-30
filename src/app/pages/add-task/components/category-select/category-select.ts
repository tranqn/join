import { Component, input, output, signal, HostListener } from '@angular/core';

@Component({
	selector: 'app-category-select',
	imports: [],
	templateUrl: './category-select.html',
	styleUrl: './category-select.scss',
})
export class CategorySelect {
	selectedCategory = input<string>('');
	isInvalid = input<boolean>(false);
	categorySelected = output<string>();

	isOpen = signal(false);

	categories = [
		{ value: 'technical', label: 'Technical Task' },
		{ value: 'user-story', label: 'User Story' }
	];

	toggle() {
		this.isOpen.update(open => !open);
	}

	selectCategory(value: string) {
		this.categorySelected.emit(value);
		this.isOpen.set(false);
	}

	getSelectedLabel(): string {
		const value = this.selectedCategory();
		const category = this.categories.find(c => c.value === value);
		return category?.label || 'Select task category';
	}

	@HostListener('document:click', ['$event'])
	onDocumentClick(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.category-wrapper')) {
			this.isOpen.set(false);
		}
	}
}
