
import { Component, signal, inject } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {RouterLink, Router} from "@angular/router";

@Component({
  selector: 'app-connexion',
  imports: [FormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {

  private http = inject(HttpClient);
  private router = inject(Router);

  email = signal("")
  password = signal("")

  emailError = signal("")
  passwordError = signal("")

  handleLogin = async(e:Event)=> {
    e.preventDefault()

    this.emailError.set("")
    this.passwordError.set("")

      this.http
        .post<any>(`${this.env.REACT_APP_API_URL}api/user/login`, {
          email: this.email(),
          password: this.password(),
        }, { withCredentials: true }
        )
        .subscribe({
          next: (response) => {
            if (response.errors) {
              this.emailError.set(response.errors.email || "");
              this.passwordError.set(response.errors.password || "");
            } else {
              this.router.navigateByUrl("/")
            }
          },
          error: (err) => {
            console.log(err)
          },
        });
  }
}

