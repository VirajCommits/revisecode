import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-note-popup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-popup.component.html',
  styleUrls: ['./note-popup.component.scss']
})
export class NotePopupComponent {
  @Input() isVisible = false;
  @Output() saveNote = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  
  note: string = '';

  onSave() {
    this.saveNote.emit(this.note);
    this.note = '';
  }

  onClose() {
    this.close.emit();
  }
}
