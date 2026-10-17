import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';
import { Film, Utilisateur } from '../models';
import { FilmService } from '../services/film.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-admin',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage {
  utilisateurs: Utilisateur[] = [];

  titreFilm = '';
  anneeFilm: number | null = null;
  resumeFilm = '';

  erreurTitre = '';
  erreurAnnee = '';

  constructor(
    private utilisateursService: UtilisateurService,
    private filmsService: FilmService,
    private alertController: AlertController,
    private toast: ToastController,
  ) {}

  async ionViewWillEnter(): Promise<void> {
    await this.filmsService.chargerFilmsAdmin();
    await this.chargerUtilisateurs();
  }

  private async chargerUtilisateurs(): Promise<void> {
    this.utilisateurs = await this.utilisateursService.getTous();
  }

  private validerFilm(): boolean {
    this.erreurTitre = '';
    this.erreurAnnee = '';

    if (this.titreFilm.trim() === '') {
      this.erreurTitre = 'Le titre est obligatoire.';
    } else if (this.filmsService.estDejaPresent(this.titreFilm)) {
      this.erreurTitre = 'Ce film existe deja dans la base.';
    }

    if (this.anneeFilm === null) {
      this.erreurAnnee = 'L annee est obligatoire.';
    } else if (Number(this.anneeFilm) < 1888 || Number(this.anneeFilm) > 2100) {
      this.erreurAnnee = 'L annee doit etre entre 1888 et 2100.';
    }

    return this.erreurTitre === '' && this.erreurAnnee === '';
  }

  async ajouterFilm(): Promise<void> {
    if (!this.validerFilm()) {
      return;
    }

    const film: Film = {
      id: Date.now(),
      titre: this.titreFilm,
      image: 'https://picsum.photos/seed/' + Date.now() + '/300/450',
      resume: this.resumeFilm,
      annee: Number(this.anneeFilm),
      note: 0,
    };

    await this.filmsService.ajouter(film);

    const toast = await this.toast.create({
      header: 'Film ajoute',
      message: this.titreFilm,
      duration: 1500,
      color: 'success',
    });

    await toast.present();

    this.titreFilm = '';
    this.anneeFilm = null;
    this.resumeFilm = '';
  }

  async changerActif(utilisateur: Utilisateur): Promise<void> {
    const seraActif = !utilisateur.actif;

    const alert = await this.alertController.create({
      header: seraActif ? 'Reactiver le compte' : 'Desactiver le compte',
      message:
        'Voulez-vous ' +
        (seraActif ? 'reactiver' : 'desactiver') +
        ' ' +
        utilisateur.prenom +
        ' ' +
        utilisateur.nom +
        ' ?',
      buttons: [
        { text: 'Annuler', role: 'cancel' },
        {
          text: seraActif ? 'Reactiver' : 'Desactiver',
          handler: async () => {
            await this.utilisateursService.changerActif(utilisateur.id, seraActif);
            await this.chargerUtilisateurs();
          },
        },
      ],
    });

    await alert.present();
  }
}