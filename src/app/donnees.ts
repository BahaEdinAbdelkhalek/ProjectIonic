import { Film, Role } from './models';

export interface CompteDemo {
  nom: string;
  prenom: string;
  age: number;
  photo: string;
  email: string;
  motDePasse: string;
  role: Role;
  actif: boolean;
  favoris: number[];
}

export const FILMS_DEPART: Film[] = [
  {
    id: 27205,
    titre: 'Inception',
    image: 'https://picsum.photos/seed/inception/300/450',
    resume:
      "Un voleur specialise dans le vol de secrets reveilematin pendant son reve recoit une mission : s introduire dans l esprit d un heritier pour y implanter une idee.",
    annee: 2010,
    note: 8.4,
  },
  {
    id: 603,
    titre: 'The Matrix',
    image: 'https://picsum.photos/seed/matrix/300/450',
    resume:
      "Un programmeur decouvre que la realite qu il vit est une simulation pilotee par des machines.",
    annee: 1999,
    note: 8.2,
  },
  {
    id: 505244,
    titre: 'Dunkirk',
    image: 'https://picsum.photos/seed/dunkirk/300/450',
    resume:
      "Des soldats allies sont encercles sur la cote anglaise pendant la premiere semaine de juin 1944.",
    annee: 2017,
    note: 7.5,
  },
  {
    id: 157336,
    titre: 'Interstellar',
    image: 'https://picsum.photos/seed/interstellar/300/450',
    resume:
      "Un groupe d explorateurs utilise un trou de ver pour repousser les limites du voyage humain dans l espace.",
    annee: 2014,
    note: 8.4,
  },
  {
    id: 496243,
    titre: 'Parasite',
    image: 'https://picsum.photos/seed/parasite/300/450',
    resume:
      "Une famille au chomage vit dans un sous-sol. Un jour le fils est accepte pour donner des cours particuliers.",
    annee: 2019,
    note: 8.5,
  },
  {
    id: 19404,
    titre: 'Dilwale Dulhania Le Jayenge',
    image: 'https://picsum.photos/seed/ddlj/300/450',
    resume:
      "Un jeune indien voyage a Londres pour epouser une jeune femme choisie par ses parents.",
    annee: 1995,
    note: 7.9,
  },
  {
    id: 597,
    titre: 'Titanic',
    image: 'https://picsum.photos/seed/titanic/300/450',
    resume:
      "Un jeune homme riche et une jeune femme pauvre se rencontrent a bord du Titanic.",
    annee: 1997,
    note: 7.9,
  },
  {
    id: 680,
    titre: 'Pulp Fiction',
    image: 'https://picsum.photos/seed/pulpfiction/300/450',
    resume:
      "Les histoires de deux gangsters de Los Angeles dont les trajectoires s entrecroisent dans quatre histoires de crime.",
    annee: 1994,
    note: 8.5,
  },
  {
    id: 13,
    titre: 'Forrest Gump',
    image: 'https://picsum.photos/seed/forrest/300/450',
    resume:
      "Les aventures d un homme simple et gentil a travers les grandes Ameriques.",
    annee: 1994,
    note: 8.5,
  },
  {
    id: 129,
    titre: 'Les listes Schmitz',
    image: 'https://picsum.photos/seed/leslistes/300/450',
    resume:
      "Un jeune homme passe sa journee a repondre au telephone et a inscrire ses activites sur une liste.",
    annee: 1995,
    note: 8.1,
  },
];

export function filmsDepuisIds(ids: number[]): Film[] {
  const films: Film[] = [];

  for (const id of ids) {
    const film = FILMS_DEPART.find((f) => f.id === id);

    if (film !== undefined) {
      films.push(film);
    }
  }

  return films;
}

export const COMPTES_DEMO: CompteDemo[] = [
  {
    nom: 'Benali',
    prenom: 'Yasmine',
    age: 22,
    photo: 'https://picsum.photos/seed/yasmine/200/200',
    email: 'admin@cinema.com',
    motDePasse: 'admin123',
    role: 'admin',
    actif: true,
    favoris: [27205, 603, 505244, 157336, 13],
  },
  {
    nom: 'Jelassi',
    prenom: 'Nidhal',
    age: 25,
    photo: 'https://picsum.photos/seed/nidhal/200/200',
    email: 'nidhal@cinema.com',
    motDePasse: 'test1234',
    role: 'user',
    actif: true,
    favoris: [27205, 603, 505244, 680, 13],
  },
  {
    nom: 'Sahli',
    prenom: 'Hanin',
    age: 23,
    photo: 'https://picsum.photos/seed/hanin/200/200',
    email: 'hanin@cinema.com',
    motDePasse: 'test1234',
    role: 'user',
    actif: true,
    favoris: [27205, 603, 505244, 680, 13, 496243],
  },
  {
    nom: 'Gharbi',
    prenom: 'Ahmed',
    age: 30,
    photo: 'https://picsum.photos/seed/ahmed/200/200',
    email: 'ahmed@cinema.com',
    motDePasse: 'test1234',
    role: 'user',
    actif: true,
    favoris: [603, 680, 13],
  },
];