import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-board',
  imports: [FormsModule],
  templateUrl: './board.html',
  styleUrl: './board.scss',
})
export class Board {
  search = signal('');
}
