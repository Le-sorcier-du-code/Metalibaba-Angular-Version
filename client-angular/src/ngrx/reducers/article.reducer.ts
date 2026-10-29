import { createReducer, on } from '@ngrx/store';
import * as ArticleActions from '../actions/articles.action'

//A perfectionner et corriger

// ========== State ==========
export interface ArticleState {
  articles: any[];
  selectedArticle: any | null;
  loading: boolean;
  error: string | null;
}

export const initialState: ArticleState = {
  articles: [],
  selectedArticle: null,
  loading: false,
  error: null
};

type Article = {
    articleId: string,
    picture: string,
    name: string,
    typeArticle: string,
    groupe: string,
    price: string
    likers:[string],
    dislikers:[string],
}

type likeId = {
  articleId: string,
  userId: string
}

type comment = {
  articleId: string,
  commentId: string,
  commenterId: string,
  text: string
}

// ========== Reducer ==========
export const articleReducer = createReducer(
  initialState,

  // ===== Chargement de tous les articles =====
  on(ArticleActions.loadAllArticles, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArticleActions.loadAllArticlesSuccess, (state:any, { articles }:any) => ({
    ...state,
    articles,
    loading: false
  })),
  on(ArticleActions.loadAllArticlesFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Chargement d'un article =====
  on(ArticleActions.loadArticle, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArticleActions.loadArticleSuccess, (state:any, { articleId }:Article) => ({
    ...state,
    selectedArticle: articleId,
    loading: false
  })),
  on(ArticleActions.loadArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Ajout =====
  on(ArticleActions.addArticle, (state:any) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ArticleActions.addArticleSuccess, (state:any) => ({
    ...state,
    loading: false
  })),
  on(ArticleActions.addArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Mise à jour =====
  on(ArticleActions.updateArticleSuccess, (state:any, { articleId, name, typeArticle, groupe, price }:Article) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? { ...article, name, typeArticle, groupe, price }
        : article
    ),
    selectedArticle:
      state.selectedArticle?._id === articleId
        ? { ...state.selectedArticle, name, typeArticle, groupe, price }
        : state.selectedArticle
  })),
  on(ArticleActions.updateArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Upload picture =====
  on(ArticleActions.uploadArticlePictureSuccess, (state:any, { picture }:Article) => ({
    ...state,
    selectedArticle: state.selectedArticle
      ? { ...state.selectedArticle, picture }
      : null,
    articles: state.articles.map((article:any) =>
      state.selectedArticle && article._id === state.selectedArticle._id
        ? { ...article, picture }
        : article
    )
  })),
  on(ArticleActions.uploadArticlePictureFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Suppression =====
  on(ArticleActions.deleteArticleSuccess, (state:any, { articleId }:Article) => ({
    ...state,
    articles: state.articles.filter((article:any) => article._id !== articleId),
    //"déselectionner" l'article pour éviter des bugs potentiels
    selectedArticle:
      state.selectedArticle?._id === articleId ? null : state.selectedArticle
  })),
  on(ArticleActions.deleteArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  // ===== Likes / Dislikes =====
  on(ArticleActions.likeArticleSuccess, (state:any, { articleId, userId }:likeId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            likers: article.likers?.includes(userId)
              ? article.likers
              : [...(article.likers || []), userId],
            dislikers: (article.dislikers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),
  on(ArticleActions.likeArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  on(ArticleActions.unlikeArticleSuccess, (state:any, { articleId, userId }:likeId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            likers: (article.likers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),
  on(ArticleActions.unlikeArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  on(ArticleActions.dislikeArticleSuccess, (state:any, { articleId, userId }:likeId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            dislikers: article.dislikers?.includes(userId)
              ? article.dislikers
              : [...(article.dislikers || []), userId],
            likers: (article.likers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),
  on(ArticleActions.dislikeArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  })),

  on(ArticleActions.undislikeArticleSuccess, (state:any, { articleId, userId }:likeId) => ({
    ...state,
    articles: state.articles.map((article:any) =>
      article._id === articleId
        ? {
            ...article,
            dislikers: (article.dislikers || []).filter((id: string) => id !== userId)
          }
        : article
    )
  })),
);
on(ArticleActions.undislikeArticleFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  }))

// ===== Comment =====

on (ArticleActions.addComment, (state:any) => ({
  ...state,
  loading: true,
  error: false
}))

on(ArticleActions.addCommentSuccess, (state:any) => ({
    ...state,
    loading: false
  })),
on(ArticleActions.addCommentFailure, (state:any, { error }:any) => ({
  ...state,
  loading: false,
  error
}))

on(ArticleActions.updateCommentSuccess, (state:any, { articleId, commentId, commenterId, text }:comment) => ({
    ...state,
    comments: state.comments.map((comment:any) =>
      comment._id === commentId
        ? { ...comment, articleId, commenterId, text }
        : comment
    ),
    selectedComment:
      state.selectedComment?._id === commentId
        ? { ...state.selectedComment, articleId, commentId, commenterId, text }
        : state.selectedComment
  })),
  on(ArticleActions.updateCommentFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  }))

  on(ArticleActions.deleteCommentSuccess, (state:any, { commentId }:comment) => ({
    ...state,
    comments: state.comments.filter((comment:any) => comment._id !== commentId),
    //"déselectionner" l'article pour éviter des bugs potentiels
    selectedComment:
      state.selectedComment?._id === commentId ? null : state.selectedComment
  })),
  on(ArticleActions.deleteCommentFailure, (state:any, { error }:any) => ({
    ...state,
    loading: false,
    error
  }))
