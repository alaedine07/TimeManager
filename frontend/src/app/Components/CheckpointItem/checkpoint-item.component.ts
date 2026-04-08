import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Checkpoint } from '../../models/task.model';

@Component({
  selector: 'app-checkpoint-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkpoint-item.component.html'
})
export class CheckpointItemComponent {
  @Input() checkpoint!: Checkpoint;
  @Input() projectId!: string;
  @Input() taskId!: string;
  @Output() completionToggled = new EventEmitter<Checkpoint>();
  @Output() updated = new EventEmitter<Checkpoint>();
  @Output() deleted = new EventEmitter<string>();

  editing = signal(false);
  editForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  startEdit() {
    this.editForm.patchValue({ name: this.checkpoint.name });
    this.editing.set(true);
  }

  saveEdit() {
    if (!this.editForm.valid) return;
    const updated = { ...this.checkpoint, name: this.editForm.value.name };
    this.updated.emit(updated);
    this.editing.set(false);
  }

  cancelEdit() {
    this.editing.set(false);
  }
}
