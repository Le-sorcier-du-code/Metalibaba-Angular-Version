import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../ngrx/actions/user.store';
import { CartStore } from '../../ngrx/actions/cart.store';
import { LogoutComponent } from '../logout/logout.component';
import { ConnexionComponent } from '../connexion/connexion.component';
import { InscriptionComponent } from '../inscription/inscription.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LogoutComponent,
    ConnexionComponent,
    InscriptionComponent
  ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class HeaderComponent {
  private userStore = inject(UserStore);
  private cartStore = inject(CartStore);

  // équivalents de useState
  hamburger = signal(false);
  connexionModal = signal(false);
  inscriptionModal = signal(false);

  // équivalent de uid (à brancher sur ton auth réelle)
  // pour l'instant on suppose que userStore expose currentUser / isLoggedIn
  uid = computed(() => this.userStore.currentUser()?._id ?? null);

  userData = computed(() => this.userStore.currentUser());
  cartNumber = computed(() => this.cartStore.cart().length);

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
