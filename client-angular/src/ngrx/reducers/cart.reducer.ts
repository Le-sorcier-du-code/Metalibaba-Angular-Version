import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';

// ========== Types ==========
export interface CartItem {
  id: string;
  price: number | string;
  quantity: number;
  [key: string]: any;
}

export interface CartState {
  cart: CartItem[];
  totalPrice: number;
}

const calculateTotalPrice = (cart: CartItem[]): number => {
  return cart.reduce((total, item) => {
    const price = parseFloat(String(item.price)) || 0;
    const quantity = parseInt(String(item.quantity), 10) || 0;
    return total + price * quantity;
  }, 0);
};

const loadCartFromStorage = (): CartItem[] => {
  try {
    const stored = localStorage.getItem('metalibaba');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const localCart = loadCartFromStorage();

export const initialState: CartState = {
  cart: localCart,
  totalPrice: calculateTotalPrice(localCart)
};

export const cartReducer = createReducer(
  initialState,


  on(CartActions.modifyCart, (state:any, { cart }) => {
    const totalPrice = calculateTotalPrice(cart);

    localStorage.setItem('metalibaba', JSON.stringify(cart));

    return {
      ...state,
      cart,
      totalPrice
    };
  }),

  on(CartActions.cleanCart, (state:any) => {
    localStorage.removeItem('metalibaba');

    return {
      ...state,
      cart: [],
      totalPrice: 0
    };
  })
);
