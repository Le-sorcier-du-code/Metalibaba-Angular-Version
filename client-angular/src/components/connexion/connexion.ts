import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-connexion',
  imports: [],
  templateUrl: './connexion.html',
  styleUrl: './connexion.css',
})
export class Connexion {
  handleRegister = async(e:any)=> {
    e.preventDefault()

    const pseudo = signal("")
    const email = signal("")
    const address = signal("")
    const setFormSubmit = signal(false)

    const terms = document.getElementById("terms") as HTMLInputElement

    const pseudoError = document.querySelector("this.pseudo.error") as HTMLInputElement
    const emailError = document.querySelector(".email.error") as HTMLInputElement
    const addressError = document.querySelector(".address.error") as HTMLInputElement
    const passwordError = document.querySelector(".password.error") as HTMLInputElement
    const passwordConfError = document.querySelector(".password-conf.error") as HTMLInputElement
    const termsError = document.querySelector(".terms.error") as HTMLInputElement

    passwordConfError.innerHTML=""
    termsError.innerHTML=""

    if(password !== passwordConfError.value || password.length < 8 || !terms.checked) {
      if (password !== passwordControl) {
        passwordConfError.innerHTML ="Les mots de passe ne correspondent pas"
      }
      if(password.length < 8) {
        passwordConfError.innerHTML ="Mot de passe trop court, minimum 8 caractères"
      }
      if(!terms.checked){
        termsError.innerHTML="Veuillez accepter les conditions générales"
      }
    } else {
      await axios({
        method:"post",
        url: `${process.env.REACT_APP_API_URL}api/user/register`,
        data: {
          pseudo,
          email,
          address
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
