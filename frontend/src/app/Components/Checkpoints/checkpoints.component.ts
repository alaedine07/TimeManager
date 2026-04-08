import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Checkpoint } from '../../models/task.model';
import { CheckpointService } from '../../services/checkpoint.service';
import { CheckpointItemComponent } from '../CheckpointItem/checkpoint-item.component';

@Component({
  selector: 'app-checkpoints',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckpointItemComponent],
  templateUrl: './checkpoints.component.html'
})
export class CheckpointsComponent {
  @Input() projectId!: string;
  @Input() taskId!: string;
  @Input() checkpoints: Checkpoint[] = [];

  open = signal(false);
  showForm = signal(false);
  checkpointForm!: FormGroup;

  constructor(
    private checkpointService: CheckpointService,
    private fb: FormBuilder
  ) {
    this.checkpointForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  toggleCheckpoints() {
    this.open.update(val => !val);
  }

  toggleForm() {
    this.showForm.update(val => !val);
    if (!this.showForm()) {
      this.checkpointForm.reset();
    }
  }

  addCheckpoint() {
    if (!this.checkpointForm.valid) return;
    const newCp = {
      name: this.checkpointForm.value.name,
      completed: false
    };
    this.checkpointService.addCheckpoint(this.projectId, this.taskId, newCp).subscribe({
      next: (created) => {
        this.checkpoints = [...this.checkpoints, created];
        this.checkpointForm.reset();
        this.showForm.set(false);
      },
      error: (err) => console.error('Failed to add checkpoint', err)
    });
  }

  toggleCheckpointCompletion(checkpoint: Checkpoint) {
    this.checkpointService.updateCheckpoint(this.projectId, this.taskId, checkpoint.id, { completed: !checkpoint.completed }).subscribe({
      next: () => {
        const index = this.checkpoints.findIndex(c => c.id === checkpoint.id);
        if (index !== -1) {
          this.checkpoints[index].completed = !checkpoint.completed;
          this.checkpoints = [...this.checkpoints];
        }
      },
      error: (err) => console.error('Failed to update checkpoint', err)
    });
  }

  onCheckpointUpdated(updated: Checkpoint) {
    const index = this.checkpoints.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      this.checkpoints[index] = updated;
      this.checkpoints = [...this.checkpoints];
    }
  }

  onCheckpointDeleted(cpId: string) {
    this.checkpointService.deleteCheckpoint(this.projectId, this.taskId, cpId).subscribe({
      next: () => {
        this.checkpoints = this.checkpoints.filter(c => c.id !== cpId);
      },
      error: (err) => console.error('Failed to delete checkpoint', err)
    });
  }
}
