import {
  signalStore,
  withState,
  withMethods,
  withComputed,
  patchState
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

// ========== Types ==========
export interface User {
  _id: string;
  name: string;
  email: string,
  password: string,
  address : string,
  picture: string
}



type UserState = {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
};

// ========== Store ==========
export const UserStore = signalStore(
  { providedIn: 'root' },

  withState<UserState>({
    users: [],
    selectedUser: null,
    loading: false,
    error: null
  }),

  withComputed((store:any) => ({
    userCount: computed(() => store.users().length),
    hasUser: computed(() => store.users().length > 0),
    hasError: computed(() => !!store.error())
  })),

  withMethods((store:any, http = inject(HttpClient)) => {
    const apiUrl = 'http://localhost:5000/api/user';

    const handleError = (error: any) => {
      const message = error?.error?.message || error?.message || 'Une erreur est survenue';
      patchState(store, { error: message, loading: false });
      return of(null);
    };

    return {

      loadAllUsers: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            http.get<User[]>(apiUrl).pipe(
              tap({
                next: (users) => patchState(store, { users, loading: false }),
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      loadUser: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((userId) =>
            http.get<User>(`${apiUrl}/${userId}`).pipe(
              tap({
                next: (user) => patchState(store, {selectedUser: user, loading: false}),
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      updateUser: rxMethod<{
        userId: string;
        name: string;
        address: string

      }>(
        pipe(
          switchMap(({ userId, name, address }) =>
            http.put(`${apiUrl}/${userId}`, { userId, name, address }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    users: state.users.map((u:any) =>
                      u._id === userId
                        ? { ...u, name, address }
                        : u
                    ),
                    selectedUser: state.selecteUser?._id === userId
                      ? { ...state.selectedUser, name, address }
                      : state.selectedUser
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      uploadUserPicture: rxMethod<{ data: FormData; userId: string }>(
        pipe(
          switchMap(({ data, userId }) =>
            http.post<{ picture?: string; errors?: any }>(`${apiUrl}/upload-userPic`, data).pipe(
              switchMap((res) => {
                if (res.errors) {
                  patchState(store, { error: res.errors });
                  return of(null);
                }

                return http.get<User>(`${apiUrl}/${userId}`).pipe(
                  tap((user) => {
                    patchState(store, (state:any) => ({
                      users: state.users.map((a:any) =>
                        a._id === userId ? { ...a, picture: user.picture } : a
                      ),
                      selectedUser: state.selectedUser?._id === userId
                        ? { ...state.selectedUser, picture: user.picture }
                        : state.selectedUser
                    }));
                  })
                );
              }),
              catchError((err) => handleError(err))
            )
          )
        )
      ),

      deleteUser: rxMethod<string>(
        pipe(
          switchMap((userId) =>
            http.delete(`${apiUrl}/${userId}`).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    users: state.users.filter((a:any) => a._id !== userId),
                    selectedUser: state.selectedUser?._id === userId
                      ? null
                      : state.selectedUser
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      updatePassword: rxMethod<{ userId: string; password: string }>(
        pipe(
          switchMap(({ userId, password }) =>
            http.put(`${apiUrl}/user/${userId}`, { password }).pipe(
              tap({
                next: () => patchState(store, { error: null }),
                error: (err) => patchState(store, {error: err?.error?.message || 'Erreur lors de la mise à jour du mot de passe'})
              })
            )
          )
        )
      ),

    }
  })
)
