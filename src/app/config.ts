import { ENV } from './env.generated';

export const CONFIG = {
  tmdbCleApi: ENV.tmdbCleApi,
  tmdbUrlApi: 'https://api.themoviedb.org/3',
  tmdbUrlImage: 'https://image.tmdb.org/t/p/w500',

  firebase: ENV.firebase,
};