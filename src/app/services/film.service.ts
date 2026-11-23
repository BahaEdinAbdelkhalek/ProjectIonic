import { Injectable } from '@angular/core';
import { firstValueFrom, Observable, map } from 'rxjs';
import { COMPTES_DEMO, FILMS_DEPART, filmsDepuisIds } from '../donnees';
import { Film } from '../models';
import { ApiService } from './api.service';
import { CONFIG } from '../config';
import { HttpClient } from '@angular/common/http';

interface FilmApi {
  id: number;
  titre: string;
  image: string;
  resume: string;
  annee: number;
  note: number;
}

@Injectable({ providedIn: 'root' })
export class FilmService {
  private filmsAdmin: Film[] = [];
  private filmsAdminCharges = false;
  private filmsMemoire: Film[] = [];

  constructor(
    private api: ApiService,
    private http: HttpClient,
  ) {}

  async chargerFilmsAdmin(): Promise<void> {
    if (this.filmsAdminCharges) {
      return;
    }

    this.filmsAdminCharges = true;
  }

  getTous(): Film[] {
    return [...FILMS_DEPART, ...this.filmsAdmin, ...this.filmsMemoire];
  }

  getParId(id: number): Film | undefined {
    return this.getTous().find((f) => f.id === id);
  }

  estDejaPresent(titre: string): boolean {
    const recherche = titre.trim().toLowerCase();
    return this.getTous().some((f) => f.titre.trim().toLowerCase() === recherche);
  }

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

  getPopulaires(): Observable<Film[]> {
    return this.api.get<FilmApi[]>('/films').pipe(
      map((films) => films.map((film) => this.depuisApi(film))),
    );
  }

  rechercher(texte: string): Observable<Film[]> {
    if (texte.trim() === '') {
      return this.getPopulaires();
    }

    return this.api
      .get<FilmApi[]>('/films?query=' + encodeURIComponent(texte))
      .pipe(map((films) => films.map((film) => this.depuisApi(film))));
  }

  async ajouter(film: Film): Promise<Film> {
    await firstValueFrom(
      this.api.post<FilmApi>('/admin/films', {
        titre: film.titre,
        resume: film.resume,
        annee: film.annee,
        note: film.note,
      }),
    );

    this.filmsAdmin = [...this.filmsAdmin, film];
    return film;
  }
}