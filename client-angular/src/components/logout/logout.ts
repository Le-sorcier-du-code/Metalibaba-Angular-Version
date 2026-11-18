import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.css',
})
export class Logout {
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = signal(false);

  private apiUrl = `${this.env.REACT_APP_API_URL}api/user/logout}`;

  private removeCookie(key: string) {
    // équivalent simple de js-cookie remove
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  unlog() {;

    this.http
      .get(`${this.apiUrl}/logout`, { withCredentials: true })
      .subscribe({
        next: () => {
          this.removeCookie('jwt');
          this.loading.set(false);
          this.router.navigateByUrl('/');
        },
        error: (err) => {
          console.log(err);
          this.removeCookie('jwt');
          this.router.navigateByUrl('/');
        },
      });
  }
}
