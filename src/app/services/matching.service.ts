import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Correspondance, Film, Utilisateur } from '../models';
import { ApiService } from './api.service';
import { UtilisateurService } from './utilisateur.service';

export const SEUIL_CORRESPONDANCE = 75;

interface FilmApi {
  id: number;
  titre: string;
  image: string;
  resume: string;
  annee: number;
  note: number;
}

interface CorrespondanceApi {
  utilisateur: {
    id: number;
    nom: string;
    prenom: string;
    age: number;
    photo: string;
    email: string;
    role: string;
    actif: boolean;
  };
  taux: number;
  filmsCommuns: FilmApi[];
}

@Injectable({ providedIn: 'root' })
export class MatchingService {
  constructor(
    private api: ApiService,
    private utilisateurs: UtilisateurService,
  ) {}

  getFilmsCommuns(mesFilms: Film[], sesFilms: Film[]): Film[] {
    return mesFilms.filter((film) => sesFilms.some((autre) => autre.id === film.id));
  }

  calculerTaux(mesFilms: Film[], sesFilms: Film[]): number {
    if (mesFilms.length === 0 || sesFilms.length === 0) {
      return 0;
    }

    const communs = this.getFilmsCommuns(mesFilms, sesFilms).length;

    return Math.round((communs / (mesFilms.length + sesFilms.length)) * 200);
  }

  async getCorrespondances(moi: Utilisateur): Promise<Correspondance[]> {
    const data = await firstValueFrom(this.api.get<CorrespondanceApi[]>('/matching'));

    return data.map((item) => ({
      utilisateur: {
        id: String(item.utilisateur.id),
        nom: item.utilisateur.nom,
        prenom: item.utilisateur.prenom,
        age: item.utilisateur.age,
        photo: item.utilisateur.photo,
        email: item.utilisateur.email,
        role: item.utilisateur.role === 'admin' ? 'admin' : 'user',
        actif: item.utilisateur.actif,
      } as Utilisateur,
      taux: item.taux,
      filmsCommuns: item.filmsCommuns.map((film) => ({
        id: film.id,
        titre: film.titre,
        image: film.image,
        resume: film.resume,
        annee: film.annee,
        note: film.note,
      })),
    }));
  }
}