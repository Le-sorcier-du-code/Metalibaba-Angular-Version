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
export interface Article {
  _id: string;
  name: string;
  typeArticle: string;
  groupe: string;
  price: string;
  picture?: string;
  likers: string[];
  dislikers: string[];
  comments?: Comment[];
}

export interface Comment {
  _id: string;
  commenterId: string;
  commenterName: string;
  text: string;
  timestamp?: string;
}

type ArticleState = {
  articles: Article[];
  selectedArticle: Article | null;
  loading: boolean;
  error: string | null;
};

// ========== Store ==========
export const ArticleStore = signalStore(
  { providedIn: 'root' },

  withState<ArticleState>({
    articles: [],
    selectedArticle: null,
    loading: false,
    error: null
  }),

  withComputed((store:any) => ({
    articlesCount: computed(() => store.articles().length),
    hasArticles: computed(() => store.articles().length > 0),
    hasError: computed(() => !!store.error())
  })),

  withMethods((store:any, http = inject(HttpClient)) => {
    const apiUrl = 'http://localhost:5000/api/article';

    // Helper pour gérer les erreurs proprement
    const handleError = (error: any) => {
      const message = error?.error?.message || error?.message || 'Une erreur est survenue';
      patchState(store, { error: message, loading: false });
      return of(null);
    };

    return {

      loadAllArticles: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            http.get<Article[]>(apiUrl).pipe(
              tap({
                next: (articles) => patchState(store, { articles, loading: false }),
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      loadArticle: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((articleId) =>
            http.get<Article>(`${apiUrl}/${articleId}`).pipe(
              tap({
                next: (article) => patchState(store, {
                  selectedArticle: article,
                  loading: false
                }),
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      // ==========================================
      // CRUD
      // ==========================================

      addArticle: rxMethod<any>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((data) =>
            http.post<Article>(apiUrl, data).pipe(
              tap({
                next: (newArticle) => {
                  patchState(store, (state:any) => ({
                    articles: [...state.articles, newArticle],
                    loading: false
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      updateArticle: rxMethod<{
        articleId: string;
        name: string;
        typeArticle: string;
        groupe: string;
        price: string;
      }>(
        pipe(
          switchMap(({ articleId, name, typeArticle, groupe, price }) =>
            http.put(`${apiUrl}/${articleId}`, { name, typeArticle, groupe, price }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.map((a:any) =>
                      a._id === articleId
                        ? { ...a, name, typeArticle, groupe, price }
                        : a
                    ),
                    selectedArticle: state.selectedArticle?._id === articleId
                      ? { ...state.selectedArticle, name, typeArticle, groupe, price }
                      : state.selectedArticle
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      uploadArticlePicture: rxMethod<{ data: FormData; articleId: string }>(
        pipe(
          switchMap(({ data, articleId }) =>
            http.post<{ picture?: string; errors?: any }>(`${apiUrl}/upload-articlePic`, data).pipe(
              switchMap((res) => {
                if (res.errors) {
                  patchState(store, { error: res.errors });
                  return of(null);
                }
                // On récupère l'article à jour pour avoir la nouvelle picture
                return http.get<Article>(`${apiUrl}/${articleId}`).pipe(
                  tap((article) => {
                    patchState(store, (state:any) => ({
                      articles: state.articles.map((a:any) =>
                        a._id === articleId ? { ...a, picture: article.picture } : a
                      ),
                      selectedArticle: state.selectedArticle?._id === articleId
                        ? { ...state.selectedArticle, picture: article.picture }
                        : state.selectedArticle
                    }));
                  })
                );
              }),
              catchError((err) => handleError(err))
            )
          )
        )
      ),

      deleteArticle: rxMethod<string>(
        pipe(
          switchMap((articleId) =>
            http.delete(`${apiUrl}/${articleId}`).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.filter((a:any) => a._id !== articleId),
                    selectedArticle: state.selectedArticle?._id === articleId
                      ? null
                      : state.selectedArticle
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      // ==========================================
      // Likes / Dislikes
      // ==========================================

      likeArticle: rxMethod<{ articleId: string; userId: string }>(
        pipe(
          switchMap(({ articleId, userId }) =>
            http.patch(`${apiUrl}/like-article${articleId}`, { id: userId }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.map((a:any) =>
                      a._id === articleId
                        ? {
                            ...a,
                            likers: a.likers.includes(userId) ? a.likers : [...a.likers, userId],
                            // optionnel : retirer des dislikers si besoin
                            dislikers: a.dislikers.filter((id:any) => id !== userId)
                          }
                        : a
                    )
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      unlikeArticle: rxMethod<{ articleId: string; userId: string }>(
        pipe(
          switchMap(({ articleId, userId }) =>
            http.patch(`${apiUrl}/unlike-article${articleId}`, { id: userId }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.map((a:any) =>
                      a._id === articleId
                        ? { ...a, likers: a.likers.filter((id:any) => id !== userId) }
                        : a
                    )
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      dislikeArticle: rxMethod<{ articleId: string; userId: string }>(
        pipe(
          switchMap(({ articleId, userId }) =>
            http.patch(`${apiUrl}/dislike-article${articleId}`, { id: userId }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.map((a:any) =>
                      a._id === articleId
                        ? {
                            ...a,
                            dislikers: a.dislikers.includes(userId) ? a.dislikers : [...a.dislikers, userId],
                            likers: a.likers.filter((id:any) => id !== userId)
                          }
                        : a
                    )
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      undislikeArticle: rxMethod<{ articleId: string; userId: string }>(
        pipe(
          switchMap(({ articleId, userId }) =>
            http.patch(`${apiUrl}/undislike-article${articleId}`, { id: userId }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => ({
                    articles: state.articles.map((a:any) =>
                      a._id === articleId
                        ? { ...a, dislikers: a.dislikers.filter((id:string) => id !== userId) }
                        : a
                    )
                  }));
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      // ==========================================
      // Comments
      // ==========================================

      addComment: rxMethod<{
        articleId: string;
        commentId: string;
        commenterId: string;
        text: string;
        commenterName: string;
      }>(
        pipe(
          switchMap((payload:any) =>
            http.patch(`${apiUrl}/comment-article/${payload.articleId}`, {
              commentId: payload.commentId,
              commenterId: payload.commenterId,
              text: payload.text,
              commenterName: payload.commenterName
            }).pipe(
              tap({
                next: () => {
                  // Stratégie simple : on recharge l'article pour avoir les commentaires à jour
                  // (plus sûr si le backend renvoie la liste complète)
                  // Tu peux aussi faire une mise à jour optimiste si tu préfères
                },
                error: (err) => handleError(err)
              }),
              // On enchaîne sur un reload de l'article
              switchMap(() => http.get<Article>(`${apiUrl}/${payload.articleId}`)),
              tap((article) => {
                patchState(store, (state:any) => ({
                  articles: state.articles.map((a:any) =>
                    a._id === payload.articleId ? article : a
                  ),
                  selectedArticle: state.selectedArticle?._id === payload.articleId
                    ? article
                    : state.selectedArticle
                }));
              })
            )
          )
        )
      ),

      editComment: rxMethod<{
        articleId: string;
        commentId: string;
        text: string;
      }>(
        pipe(
          switchMap(({ articleId, commentId, text }) =>
            http.patch(`${apiUrl}/edit-comment-article/${articleId}`, {
              commentId,
              text
            }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => {
                    const updateComments = (comments: Comment[] = []) =>
                      comments.map(c =>
                        c._id === commentId ? { ...c, text } : c
                      );

                    return {
                      articles: state.articles.map((a:any) =>
                        a._id === articleId
                          ? { ...a, comments: updateComments(a.comments) }
                          : a
                      ),
                      selectedArticle: state.selectedArticle?._id === articleId
                        ? {
                            ...state.selectedArticle,
                            comments: updateComments(state.selectedArticle.comments)
                          }
                        : state.selectedArticle
                    };
                  });
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      ),

      deleteComment: rxMethod<{ articleId: string; commentId: string }>(
        pipe(
          switchMap(({ articleId, commentId }) =>
            http.patch(`${apiUrl}/delete-comment-article/${articleId}`, { commentId }).pipe(
              tap({
                next: () => {
                  patchState(store, (state:any) => {
                    const filterComments = (comments: Comment[] = []) =>
                      comments.filter(c => c._id !== commentId);

                    return {
                      articles: state.articles.map((a:any) =>
                        a._id === articleId
                          ? { ...a, comments: filterComments(a.comments) }
                          : a
                      ),
                      selectedArticle: state.selectedArticle?._id === articleId
                        ? {
                            ...state.selectedArticle,
                            comments: filterComments(state.selectedArticle.comments)
                          }
                        : state.selectedArticle
                    };
                  });
                },
                error: (err) => handleError(err)
              })
            )
          )
        )
      )
    };
  })
);


