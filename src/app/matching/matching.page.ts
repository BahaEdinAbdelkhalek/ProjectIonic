import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Correspondance, Utilisateur } from '../models';
import { FavorisService } from '../services/favoris.service';
import { MatchingService, SEUIL_CORRESPONDANCE } from '../services/matching.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-matching',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './matching.page.html',
  styleUrls: ['./matching.page.scss'],
})
export class MatchingPage {
  correspondances: Correspondance[] = [];
  connecte: Utilisateur | null = null;
  totalFavoris = 0;
  chargement = true;
  seuil = SEUIL_CORRESPONDANCE;

  constructor(
    private matching: MatchingService,
    private favoris: FavorisService,
    private utilisateurs: UtilisateurService,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    await this.calculer();
  }

  async rafraichir(evenement?: CustomEvent): Promise<void> {
    await this.calculer();

    if (evenement !== undefined) {
      await (evenement.target as HTMLIonRefresherElement).complete();
    }
  }

  private async calculer(): Promise<void> {
    this.chargement = true;

    const connecte = this.utilisateurs.getConnecte();
    this.connecte = connecte;

    if (connecte === null) {
      this.correspondances = [];
      this.totalFavoris = 0;
      this.chargement = false;
      return;
    }

    this.totalFavoris = (await this.favoris.getFavoris(connecte.id)).length;
    this.correspondances = await this.matching.getCorrespondances(connecte);
    this.chargement = false;
  }

  couleurTaux(taux: number): string {
    if (taux === 100) {
      return 'success';
    }

    if (taux >= 90) {
      return 'primary';
    }

    return 'warning';
  }
}