import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(racine, '.env');
const cible = join(racine, 'src', 'app', 'env.generated.ts');

const variables = {};

if (existsSync(source)) {
  for (const ligne of readFileSync(source, 'utf8').split('\n')) {
    const propre = ligne.trim();

    if (propre === '' || propre.startsWith('#')) {
      continue;
    }

    const position = propre.indexOf('=');

    if (position < 1) {
      continue;
    }

    variables[propre.slice(0, position).trim()] = propre.slice(position + 1).trim();
  }
}

const lire = (nom) => variables[nom] ?? '';

const contenu = `export const ENV = {
  tmdbCleApi: '${lire('TMDB_CLE_API')}',
  firebase: {
    apiKey: '${lire('FIREBASE_API_KEY')}',
    authDomain: '${lire('FIREBASE_AUTH_DOMAIN')}',
    projectId: '${lire('FIREBASE_PROJECT_ID')}',
    storageBucket: '${lire('FIREBASE_STORAGE_BUCKET')}',
    messagingSenderId: '${lire('FIREBASE_MESSAGING_SENDER_ID')}',
    appId: '${lire('FIREBASE_APP_ID')}',
  },
};
`;

writeFileSync(cible, contenu, 'utf8');

if (lire('TMDB_CLE_API') === '') {
  console.log('.env absent ou cle TMDB vide : l application tournera avec les films de depart.');
} else {
  console.log('Configuration generee depuis .env');
}