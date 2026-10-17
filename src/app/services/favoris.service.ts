import { Injectable } from '@angular/core';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Film } from '../models';
import { FirebaseService } from './firebase.service';

const COLLECTION = 'favoris';

@Injectable({ providedIn: 'root' })
export class FavorisService {
  constructor(private firebase: FirebaseService) {}

  private async ecrire(utilisateurId: string, films: Film[]): Promise<void> {
    await setDoc(doc(this.firebase.db, COLLECTION, utilisateurId), { films: films });
  }

  async getFavoris(utilisateurId: string): Promise<Film[]> {
    const document = await getDoc(doc(this.firebase.db, COLLECTION, utilisateurId));

    if (!document.exists()) {
      return [];
    }

    const films = document.data()['films'];

    if (!Array.isArray(films)) {
      return [];
    }

    return films as Film[];
  }

  async getIds(utilisateurId: string): Promise<number[]> {
    const films = await this.getFavoris(utilisateurId);
    return films.map((film) => film.id);
  }

  async estFavori(utilisateurId: string, filmId: number): Promise<boolean> {
    const ids = await this.getIds(utilisateurId);
    return ids.includes(filmId);
  }

  async ajouter(utilisateurId: string, film: Film): Promise<void> {
    const films = await this.getFavoris(utilisateurId);

    if (!films.some((f) => f.id === film.id)) {
      await this.ecrire(utilisateurId, [...films, film]);
    }
  }

  async supprimer(utilisateurId: string, filmId: number): Promise<void> {
    const films = await this.getFavoris(utilisateurId);
    await this.ecrire(
      utilisateurId,
      films.filter((f) => f.id !== filmId),
    );
  }

  async basculer(utilisateurId: string, film: Film): Promise<boolean> {
    const films = await this.getFavoris(utilisateurId);

    if (films.some((f) => f.id === film.id)) {
      await this.ecrire(
        utilisateurId,
        films.filter((f) => f.id !== film.id),
      );
      return false;
    }

    await this.ecrire(utilisateurId, [...films, film]);
    return true;
  }

  async remplacer(utilisateurId: string, films: Film[]): Promise<void> {
    await this.ecrire(utilisateurId, films);
  }
}