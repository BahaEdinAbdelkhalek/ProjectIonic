import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import { CONFIG } from '../config';
import { FILMS_DEPART } from '../donnees';
import { Film } from '../models';
import { FirebaseService } from './firebase.service';

const COLLECTION = 'films';

interface FilmTmdb {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

interface ReponseTmdb {
  results: FilmTmdb[];
}

@Injectable({ providedIn: 'root' })
export class FilmService {
  private filmsAdmin: Film[] = [];
  private filmsAdminCharges = false;
  private filmsMemoire: Film[] = [];

  constructor(
    private http: HttpClient,
    private firebase: FirebaseService,
  ) {}

  async chargerFilmsAdmin(): Promise<void> {
    if (this.filmsAdminCharges || !this.firebase.estConfigure()) {
      return;
    }

    const resultat = await getDocs(collection(this.firebase.db, COLLECTION));
    const films: Film[] = [];

    resultat.forEach((document) => {
      const data = document.data();
      films.push({
        id: Number(data['id']),
        titre: String(data['titre'] ?? ''),
        image: String(data['image'] ?? ''),
        resume: String(data['resume'] ?? ''),
        annee: Number(data['annee'] ?? 0),
        note: Number(data['note'] ?? 0),
      });
    });

    this.filmsAdmin = films;
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

  async ajouter(film: Film): Promise<Film> {
    await setDoc(doc(this.firebase.db, COLLECTION, String(film.id)), film);

    if (!this.filmsAdmin.some((f) => f.id === film.id)) {
      this.filmsAdmin = [...this.filmsAdmin, film];
    }

    return film;
  }

  private imageTmdb(source: FilmTmdb): string {
    if (source.poster_path !== null && source.poster_path !== '') {
      return CONFIG.tmdbUrlImage + source.poster_path;
    }

    return '';
  }

  private depuisTmdb(source: FilmTmdb): Film {
    return {
      id: source.id,
      titre: source.title,
      image: this.imageTmdb(source),
      resume: source.overview,
      annee: Number(source.release_date.slice(0, 4)),
      note: Math.round(source.vote_average * 10) / 10,
    };
  }

  private getBd(): boolean {
    return CONFIG.tmdbCleApi.trim() !== '';
  }

  private getCatalogue(): Film[] {
    return [...FILMS_DEPART, ...this.filmsAdmin];
  }

  private memoriser(films: Film[]): Film[] {
    for (const film of films) {
      if (!this.filmsMemoire.some((f) => f.id === film.id)) {
        this.filmsMemoire = [...this.filmsMemoire, film];
      }
    }

    return films;
  }

  private avecImage(films: Film[]): Film[] {
    return films.filter((film) => film.image !== '');
  }

  getPopulaires(): Observable<Film[]> {
    if (!this.getBd()) {
      return of(this.getCatalogue());
    }

    return this.http
      .get<ReponseTmdb>(CONFIG.tmdbUrlApi + '/movie/popular', {
        params: { api_key: CONFIG.tmdbCleApi, language: 'fr-FR' },
      })
      .pipe(
        map((reponse) =>
          this.avecImage(
          this.memoriser([
            ...reponse.results.map((film) => this.depuisTmdb(film)),
            ...this.filmsAdmin,
          ]),
        ),
        ),
      );
  }

  rechercher(texte: string): Observable<Film[]> {
    if (texte.trim() === '') {
      return of(this.getCatalogue());
    }

    if (!this.getBd()) {
      const mot = texte.trim().toLowerCase();
      return of(this.getCatalogue().filter((f) => f.titre.toLowerCase().includes(mot)));
    }

    return this.http
      .get<ReponseTmdb>(CONFIG.tmdbUrlApi + '/search/movie', {
        params: { api_key: CONFIG.tmdbCleApi, language: 'fr-FR', query: texte },
      })
      .pipe(
        map((reponse) =>
          this.avecImage(
          this.memoriser([
            ...reponse.results.map((film) => this.depuisTmdb(film)),
            ...this.filmsAdmin,
          ]),
        ),
        ),
      );
  }
}