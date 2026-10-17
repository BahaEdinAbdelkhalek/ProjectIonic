import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/lazy';
import { Film } from '../models';
import { FavorisService } from '../services/favoris.service';
import { FilmService } from '../services/film.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-films',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './films.page.html',
  styleUrls: ['./films.page.scss'],
})
export class FilmsPage implements OnInit {
  films: Film[] = [];
  mesFavorisIds: number[] = [];
  chargement = true;
  recherche = '';
  utilisateurId = '';

  constructor(
    private filmsService: FilmService,
    private favorisService: FavorisService,
    private utilisateurs: UtilisateurService,
    private toast: ToastController,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const connecte = this.utilisateurs.getConnecte();
    this.utilisateurId = connecte === null ? '' : connecte.id;

    this.chargerFilms();
  }

  private async chargerFilms(): Promise<void> {
    this.chargement = true;

    await this.filmsService.chargerFilmsAdmin();
    this.mesFavorisIds = await this.favorisService.getIds(this.utilisateurId);

    this.filmsService.getPopulaires().subscribe((films) => {
      this.films = films;
      this.chargement = false;
    });
  }

  async lancerRecherche(): Promise<void> {
    this.chargement = true;

    this.filmsService.rechercher(this.recherche).subscribe(async (films) => {
      this.films = films;
      this.chargement = false;
    });
  }

  async rafraichir(evenement?: CustomEvent): Promise<void> {
    await this.chargerFilms();

    if (evenement !== undefined) {
      await (evenement.target as HTMLIonRefresherElement).complete();
    }
  }

  estFavori(film: Film): boolean {
    return this.mesFavorisIds.includes(film.id);
  }

  async basculerFavori(film: Film): Promise<void> {
    const devientFavori = await this.favorisService.basculer(this.utilisateurId, film);

    if (devientFavori) {
      this.mesFavorisIds = [...this.mesFavorisIds, film.id];
    } else {
      this.mesFavorisIds = this.mesFavorisIds.filter((id) => id !== film.id);
    }

    const toast = await this.toast.create({
      message: devientFavori
        ? film.titre + ' ajoute aux favoris'
        : film.titre + ' retire des favoris',
      duration: 1200,
      color: devientFavori ? 'success' : 'medium',
    });

    await toast.present();
  }

  voirDetail(film: Film): void {
    this.router.navigate(['/film', film.id]);
  }
}