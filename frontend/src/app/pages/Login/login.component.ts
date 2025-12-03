// frontend/src/app/pages/login/login.component.ts
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  error = signal('');
  loading = signal(false);

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.auth.login(this.username(), this.password()).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error.set('Login failed');
        this.loading.set(false);
      }
    });
  }
}
