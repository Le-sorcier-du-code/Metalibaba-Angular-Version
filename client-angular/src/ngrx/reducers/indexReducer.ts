import { provideStore } from '@ngrx/store';
import { articleReducer } from './article.reducer';
import { userReducer } from './user.reducer';
import { cartReducer } from './cart.reducer';


export const appStoreProviders = provideStore({
  articles: articleReducer,
  user: userReducer,
  cart: cartReducer
});
