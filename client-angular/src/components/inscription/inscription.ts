import { Component, signal, inject } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserStore} from "../../ngrx/actions/user.store"

@Component({
  selector: 'app-connexion',
  imports: [],
  templateUrl: './inscription.html',
  styleUrl: './inscription.css',
})
export class Connexion {

  private http = inject(HttpClient);
  private user = inject(UserStore) as any;

  pseudo = signal("")
  email = signal("")
  address = signal("")
  password = signal("")
  passwordControl = signal("")
  termsAccepted = signal(false)
  formSubmit = signal(false)

  pseudoError = signal("")
  emailError = signal("")
  addressError = signal("")
  passwordError = signal("")
  passwordConfError = signal("")
  termsError = signal("")

  handleRegister = async(e:Event)=> {
    e.preventDefault()

    this.pseudoError.set("")
    this.emailError.set("")
    this.addressError.set("")
    this.passwordError.set("")
    this.passwordConfError.set("")
    this.termsError.set("")

    const password = this.password();
    const passwordControl = this.passwordControl();

    let hasError = false;

    if(password !== passwordControl || password.length < 8 || !this.termsAccepted()) {
      if (password !== passwordControl) {
        this.passwordConfError.set("Les mots de passe ne correspondent pas")
      }
      if(password.length < 8) {
        this.passwordConfError.set("Mot de passe trop court, minimum 8 caractères")
      }
      if(!this.termsAccepted()){
        this.termsError.set("Veuillez accepter les conditions générales")
      }

      if (hasError)
        return;

      this.http
        .post<any>(`${this.env.REACT_APP_API_URL}api/user/register`, {
          pseudo: this.pseudo(),
          email: this.email(),
          address: this.address(),
          password: this.password(),
        })
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.user.setUser(response.user);
              this.formSubmit.set(true);
            }
            else {
              if (response.errors) {
                this.pseudoError.set(response.errors.pseudo || "");
                this.emailError.set(response.errors.email || "");
                this.addressError.set(response.errors.address || "");
                this.passwordError.set(response.errors.password || "");
              } else {
                this.formSubmit.set(true) }
            }
          },
          error: (err) => {
            console.log(err)
          },
        });
    }
  }
}
