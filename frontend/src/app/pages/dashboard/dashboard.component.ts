import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent {
  userName = 'John Doe';
  expandedProject: string | null = null;

  stats = [
    { title: 'Total Projects', value: 5, icon: 'trending_up', color: 'blue' },
    { title: 'Active Tasks', value: 12, icon: 'electric_bolt', color: 'purple' },
    { title: 'Completed Tasks', value: 20, icon: 'check_circle', color: 'green' },
    { title: 'Upcoming Deadlines', value: 3, icon: 'warning', color: 'orange' }
  ];

  recentActivities = [
    { text: 'Task "Design Homepage" marked complete', time: '2 hours ago', type: 'completed' },
    { text: 'New subproject "Marketing Campaign" created', time: '5 hours ago', type: 'created' },
    { text: 'Task "Update Docs" assigned to you', time: '1 day ago', type: 'assigned' }
  ];

  quickActions = [
    { label: 'Create Project' },
    { label: 'Create Task' },
    { label: 'Import Tasks' }
  ];

  projects = [
    { name: 'Website Redesign', tasksDone: 10, tasksTotal: 15, status: 'Active', progress: 67, team: 4 },
    { name: 'Mobile App', tasksDone: 5, tasksTotal: 10, status: 'Active', progress: 50, team: 3 },
    { name: 'Marketing Campaign', tasksDone: 2, tasksTotal: 5, status: 'Planning', progress: 40, team: 2 }
  ];

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'completed': '✓',
      'created': '⭐',
      'assigned': '→'
    };
    return icons[type] || '•';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'status-active',
      'Planning': 'status-planning'
    };
    return classes[status] || 'status-default';
  }

  toggleProject(projectName: string): void {
    this.expandedProject = this.expandedProject === projectName ? null : projectName;
  }

  onActionClick(action: string): void {
    console.log(`${action} clicked`);
  }
}
