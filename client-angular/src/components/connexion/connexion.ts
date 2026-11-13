import { Component, signal, inject } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserStore} from "../../ngrx/actions/user.store"

@Component({
  selector: 'app-connexion',
  imports: [],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
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
  setFormSubmit = signal(false)

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
    const terms = this.termsAccepted();

    let hasError = false;

    if(password !== passwordControl || password.length < 8 || !this.termsAccepted()) {
      if (password !== passwordControl) {
        this.passwordConfError.set("Les mots de passe ne correspondent pas")
      }
      if(password.length < 8) {
        this.passwordConfError.set("Mot de passe trop court, minimum 8 caractères")
      }
      if(!terms.checked){
        this.termsError.set("Veuillez accepter les conditions générales")
      }
    } else {
      await axios({
        method:"post",
        url: `${process.env.REACT_APP_API_URL}api/user/register`,
        data: {
          this.userpseudo,
          this.user.email,
          this.useraddress
        }
      })
      .then((res:any)=> {
        if (res.data.errors){
          pseudoError.innerHTML = res.data.errors.pseudo
          emailError.innerHTML = res.data.errors.email
          addressError.innerHTML = res.data.errors.address
          passwordError.innerHTML = res.data.errors.password
        } else {
          this.setFormSubmit.set(true)
        }
      })
      .catch((err:string)=> console.log(err))
    }
  }
}
