import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-sub-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sub-project-form.component.html',
  styleUrl: './sub-project-form.component.scss'
})
export class SubProjectFormComponent implements OnInit {
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() initialData: Project | null = null;
  @Input() parentProjectId?: string;
  @Output() saved = new EventEmitter<Omit<Project, 'id'>>();
  @Output() cancelled = new EventEmitter<void>();

  subProjectForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.subProjectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      defaultTabOnOpen: ['tasks']
    });

    if (this.initialData) {
      this.subProjectForm.patchValue({
        name: this.initialData.name,
        description: this.initialData.description || '',
        defaultTabOnOpen: this.initialData.defaultTabOnOpen || 'tasks'
      });
    }
  }

  save() {
    if (this.subProjectForm.valid) {
      const formValue = this.subProjectForm.value;
      const subProjectData: Omit<Project, 'id'> = {
        name: formValue.name,
        description: formValue.description || '',
        defaultTabOnOpen: formValue.defaultTabOnOpen,
        completed: this.initialData?.completed ?? false,
        archived: this.initialData?.archived ?? false,
        tasks: this.initialData?.tasks ?? [],
        subProjects: this.initialData?.subProjects ?? [],
        parentProjectId: this.parentProjectId || this.initialData?.parentProjectId
      };
      this.saved.emit(subProjectData);
    }
  }
}
