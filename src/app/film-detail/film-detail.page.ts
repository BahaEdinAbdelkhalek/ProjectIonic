import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Film } from '../models';
import { FavorisService } from '../services/favoris.service';
import { FilmService } from '../services/film.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-film-detail',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './film-detail.page.html',
  styleUrls: ['./film-detail.page.scss'],
})
export class FilmDetailPage {
  film: Film | undefined;
  utilisateurId = '';
  favori = false;
  chargement = true;
  introuvable = false;

  constructor(
    private route: ActivatedRoute,
    private filmsService: FilmService,
    private favorisService: FavorisService,
    private utilisateurs: UtilisateurService,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    this.chargement = true;
    this.introuvable = false;
    this.film = undefined;

    const connecte = this.utilisateurs.getConnecte();
    this.utilisateurId = connecte === null ? '' : connecte.id;

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isFinite(id)) {
      this.introuvable = true;
      this.chargement = false;
      return;
    }

    await this.filmsService.chargerFilmsAdmin();

    this.film = this.filmsService.getParId(id);
    this.introuvable = this.film === undefined;
    this.favori = await this.favorisService.estFavori(this.utilisateurId, id);
    this.chargement = false;
  }

  async basculerFavori(): Promise<void> {
    if (this.film === undefined) {
      return;
    }

    this.favori = await this.favorisService.basculer(this.utilisateurId, this.film);
  }
}