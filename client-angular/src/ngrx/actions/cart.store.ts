import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState
} from '@ngrx/signals';
import { computed } from '@angular/core';

export interface CartItem {
  id: string;
  quantity: number;
  [key: string]: any;
}

type CartState = {
  cart: CartItem[];
};

const LOCAL_STORAGE_KEY = 'metalibaba';

export const CartStore = signalStore(
  { providedIn: 'root' },

  withState<CartState>({
    cart: []
  }),

  withComputed((store:any) => ({
    totalItems: computed(() =>
      store.cart().reduce((acc:any, item:any) => acc + item.quantity, 0)
    ),
    isEmpty: computed(() => store.cart().length === 0)
  })),

  withMethods((store:any) => {

    // Sauvegarde dans le localStorage
    const saveToLocalStorage = (cart: CartItem[]) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    };

    return {

      // Charger le panier depuis le localStorage (à appeler au démarrage)
      loadCartFromStorage() {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            patchState(store, { cart: parsed });
          } catch (e) {
            console.error('Erreur lors du chargement du panier', e);
          }
        }
      },

      // Ajouter au panier (équivalent de addToCart)
      addToCart(newProduct: CartItem, quantityAdded: number = 1) {
        const currentCart = store.cart();
        const existingIndex = currentCart.findIndex((item:any) => item.id === newProduct.id);

        let updatedCart: CartItem[];

        if (existingIndex === -1) {
          // Le produit n'existe pas encore → on l'ajoute
          updatedCart = [...currentCart, { ...newProduct, quantity: quantityAdded }];
        } else {
          // Le produit existe déjà → on augmente la quantité (immutabilité)
          updatedCart = currentCart.map((item:any, index:any) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantityAdded }
              : item
          );
        }

        patchState(store, { cart: updatedCart });
        saveToLocalStorage(updatedCart);
      },

      // Supprimer un produit du panier
      deleteFromCart(productId: string) {
        const updatedCart = store.cart().filter((item:any) => item.id !== productId);
        patchState(store, { cart: updatedCart });
        saveToLocalStorage(updatedCart);
      },

      // Vider complètement le panier
      cleanCart() {
        patchState(store, { cart: [] });
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      },

      // Optionnel : modifier la quantité d'un produit déjà présent
      updateQuantity(productId: string, quantity: number) {
        const updatedCart = store.cart().map((item:any) =>
          item.id === productId ? { ...item, quantity } : item
        );
        patchState(store, { cart: updatedCart });
        saveToLocalStorage(updatedCart);
      }
    };
  })
);
