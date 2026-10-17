import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/lazy';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-login',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  motDePasse = '';
  messageErreur = '';
  chargement = false;

  constructor(
    private utilisateurs: UtilisateurService,
    private toast: ToastController,
    private router: Router,
  ) {}

  async seConnecter(): Promise<void> {
    if (this.chargement) {
      return;
    }

    this.messageErreur = '';

    if (this.email.trim() === '' || this.motDePasse === '') {
      this.messageErreur = 'Renseignez votre email et votre mot de passe.';
      return;
    }

    this.chargement = true;

    try {
      const resultat = await this.utilisateurs.connexion(this.email, this.motDePasse);

      if (!resultat.succes) {
        this.messageErreur = resultat.message;
        return;
      }

      const toast = await this.toast.create({
        header: 'Connexion reussie',
        duration: 1200,
        color: 'success',
      });

      await toast.present();
      await this.router.navigateByUrl('/tabs/films');
    } catch {
      this.messageErreur = 'Connexion impossible. Verifiez votre connexion internet.';
    } finally {
      this.chargement = false;
    }
  }

  allerAInscription(): void {
    this.router.navigateByUrl('/inscription');
  }
}