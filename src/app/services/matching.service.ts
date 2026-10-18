import { Injectable } from '@angular/core';
import { Correspondance, Film, Utilisateur } from '../models';
import { FavorisService } from './favoris.service';
import { UtilisateurService } from './utilisateur.service';

export const SEUIL_CORRESPONDANCE = 75;

@Injectable({ providedIn: 'root' })
export class MatchingService {
  constructor(
    private favoris: FavorisService,
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
    const mesFilms = await this.favoris.getFavoris(moi.id);
    const tous = await this.utilisateurs.getTous();
    const correspondances: Correspondance[] = [];

    for (const autre of tous) {
      if (autre.id === moi.id || !autre.actif) {
        continue;
      }

      const sesFilms = await this.favoris.getFavoris(autre.id);
      const taux = this.calculerTaux(mesFilms, sesFilms);

      if (taux > SEUIL_CORRESPONDANCE) {
        correspondances.push({
          utilisateur: autre,
          taux: taux,
          filmsCommuns: this.getFilmsCommuns(mesFilms, sesFilms),
        });
      }
    }

    return correspondances.sort((a, b) => b.taux - a.taux);
  }
}