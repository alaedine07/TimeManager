import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() initialData: Task | null = null;
  @Output() saved = new EventEmitter<Omit<Task, 'id'>>();
  @Output() cancelled = new EventEmitter<void>();

  taskForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.taskForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['medium'],
      dueDate: ['']
    });

    if (this.initialData) {
      this.taskForm.patchValue({
        name: this.initialData.name,
        description: this.initialData.description || '',
        priority: this.initialData.priority,
        dueDate: this.initialData.dueDate ? this.formatDateForInput(this.initialData.dueDate) : ''
      });
    }
  }

  save() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;
      const taskData: Omit<Task, 'id'> = {
        name: formValue.name,
        description: formValue.description || undefined,
        priority: formValue.priority,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined,
        completed: this.initialData?.completed ?? false
      };
      this.saved.emit(taskData);
    }
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  }
}
