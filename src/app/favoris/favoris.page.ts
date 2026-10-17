import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/lazy';
import { Film } from '../models';
import { FavorisService } from '../services/favoris.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-favoris',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './favoris.page.html',
  styleUrls: ['./favoris.page.scss'],
})
export class FavorisPage {
  films: Film[] = [];
  utilisateurId = '';
  chargement = true;

  constructor(
    private favorisService: FavorisService,
    private utilisateurs: UtilisateurService,
    private toast: ToastController,
    private router: Router,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.chargement = true;

    const connecte = this.utilisateurs.getConnecte();
    this.utilisateurId = connecte === null ? '' : connecte.id;

    this.films = await this.favorisService.getFavoris(this.utilisateurId);
    this.chargement = false;
  }

  async retirer(film: Film): Promise<void> {
    await this.favorisService.supprimer(this.utilisateurId, film.id);

    this.films = this.films.filter((f) => f.id !== film.id);

    const toast = await this.toast.create({
      message: film.titre + ' retire des favoris',
      duration: 1200,
      color: 'medium',
    });

    await toast.present();
  }

  voirDetail(film: Film): void {
    this.router.navigate(['/film', film.id]);
  }
}