import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Film } from '../models';
import { ApiService } from './api.service';

interface FilmApi {
  id: number;
  titre: string;
  image: string;
  resume: string;
  annee: number;
  note: number;
}

@Injectable({ providedIn: 'root' })
export class FavorisService {
  constructor(private api: ApiService) {}

  private depuisApi(source: FilmApi): Film {
    return {
      id: source.id,
      titre: source.titre,
      image: source.image,
      resume: source.resume,
      annee: source.annee,
      note: source.note,
    };
  }

  async getFavoris(utilisateurId: string): Promise<Film[]> {
    const films = await firstValueFrom(this.api.get<FilmApi[]>('/favoris'));
    return films.map((film) => this.depuisApi(film));
  }

  async getIds(utilisateurId: string): Promise<number[]> {
    const films = await this.getFavoris(utilisateurId);
    return films.map((film) => film.id);
  }

  async estFavori(utilisateurId: string, filmId: number): Promise<boolean> {
    const ids = await this.getIds(utilisateurId);
    return ids.includes(filmId);
  }

  async ajouter(utilisateurId: string, filmId: number): Promise<void> {
    await firstValueFrom(this.api.post<{ favori: boolean }>('/favoris/' + filmId, {}));
  }

  async supprimer(utilisateurId: string, filmId: number): Promise<void> {
    await firstValueFrom(this.api.post<{ favori: boolean }>('/favoris/' + filmId, {}));
  }

  async basculer(utilisateurId: string, film: Film): Promise<boolean> {
    const resultat = await firstValueFrom(
      this.api.post<{ favori: boolean }>('/favoris/' + film.id, {}),
    );
    return resultat.favori;
  }

  async remplacer(utilisateurId: string, films: Film[]): Promise<void> {}
}