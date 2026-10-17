export type Role = 'user' | 'admin';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  age: number;
  photo: string;
  email: string;
  role: Role;
  actif: boolean;
}

export interface Film {
  id: number;
  titre: string;
  image: string;
  resume: string;
  annee: number;
  note: number;
}

export interface Correspondance {
  utilisateur: Utilisateur;
  taux: number;
  filmsCommuns: Film[];
}