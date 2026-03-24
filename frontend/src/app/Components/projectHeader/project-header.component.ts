// fontend/src/app/Components/projectHeader/project-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../models/project.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './project-header.component.html',
  styleUrl: './project-header.component.scss'
})
export class ProjectHeaderComponent {
  @Input() project!: Project;
  @Output() backClicked = new EventEmitter<void>();
}
