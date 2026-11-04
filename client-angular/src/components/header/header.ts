import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../ngrx/actions/user.store';
import { CartStore } from '../../ngrx/actions/cart.store';
import {Logout} from "../logout/logout"
import { Connexion } from '../connexion/connexion'
import { Inscription } from '../inscription/inscription';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    Logout,
    Connexion,
    Inscription
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private user = inject(UserStore) as any;
  private cart = inject(CartStore) as any;

  //signal pour l'équivalent Angular de l'ami useState
  hamburger = signal(false);
  connexionModal = signal(false);
  inscriptionModal = signal(false);

  // équivalent de uid
  uid = computed(() => (this.user.selectedUser() as { _id?: string } | null)?._id ?? null);

  userData = computed(() => this.user.selectedUser());
  cartNumber = computed(() => this.cart.cart().length);

  uidMessage = computed(() => {
    const user = this.userData();
    return user ? `Bienvenue ${user.name}` : '';
  });

  switchConnexion() {
    this.connexionModal.update(v => !v);
    this.inscriptionModal.set(false);
  }

  switchInscription() {
    this.inscriptionModal.update(v => !v);
    this.connexionModal.set(false);
  }

  toggleHamburger() {
    this.hamburger.update(v => !v);
  }
}
