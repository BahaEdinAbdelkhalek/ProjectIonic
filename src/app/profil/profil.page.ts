import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Utilisateur } from '../models';
import { FavorisService } from '../services/favoris.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-profil',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './profil.page.html',
  styleUrls: ['./profil.page.scss'],
})
export class ProfilPage {
  connecte: Utilisateur | null = null;
  totalFavoris = 0;

  constructor(
    private utilisateurs: UtilisateurService,
    private favoris: FavorisService,
    private router: Router,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.connecte = this.utilisateurs.getConnecte();

    if (this.connecte !== null) {
      this.totalFavoris = (await this.favoris.getFavoris(this.connecte.id)).length;
    }
  }

  estAdmin(): boolean {
    return this.utilisateurs.estAdmin();
  }

  async seDeconnecter(): Promise<void> {
    await this.utilisateurs.seDeconnecter();
    this.router.navigateByUrl('/login');
  }
}