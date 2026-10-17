import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FilmService } from './services/film.service';
import { UtilisateurService } from './services/utilisateur.service';

@Component({
  selector: 'app-root',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private utilisateurs: UtilisateurService,
    private films: FilmService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.utilisateurs.attendrePret();
    await this.films.chargerFilmsAdmin();
  }
}