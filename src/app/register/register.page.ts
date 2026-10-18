import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular/lazy';
import { CameraService } from '../services/camera.service';
import { UtilisateurService } from '../services/utilisateur.service';

@Component({
  selector: 'app-register',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  prenom = '';
  nom = '';
  age: number | null = null;
  email = '';
  motDePasse = '';
  photo = '';
  photoEnCours = false;
  envoi = false;

  erreurPrenom = '';
  erreurNom = '';
  erreurAge = '';
  erreurEmail = '';
  erreurMotDePasse = '';
  erreurPhoto = '';
  message = '';

  constructor(
    private utilisateurs: UtilisateurService,
    private camera: CameraService,
    private toast: ToastController,
    private router: Router,
  ) {}

  private toutEffacer(): void {
    this.erreurPrenom = '';
    this.erreurNom = '';
    this.erreurAge = '';
    this.erreurEmail = '';
    this.erreurMotDePasse = '';
    this.erreurPhoto = '';
    this.message = '';
  }

  async prendrePhoto(): Promise<void> {
    this.erreurPhoto = '';
    this.photoEnCours = true;

    try {
      this.photo = await this.camera.prendrePhoto();
    } catch {
      const toast = await this.toast.create({
        header: 'Camera indisponible',
        message: 'Impossible d utiliser la camera.',
        duration: 2500,
        color: 'danger',
      });

      await toast.present();
    }

    this.photoEnCours = false;
  }

  private toutEstValide(): boolean {
    return (
      this.erreurPrenom === '' &&
      this.erreurNom === '' &&
      this.erreurAge === '' &&
      this.erreurEmail === '' &&
      this.erreurMotDePasse === '' &&
      this.erreurPhoto === ''
    );
  }

  private async valider(): Promise<boolean> {
    this.toutEffacer();

    if (this.prenom.trim() === '') {
      this.erreurPrenom = 'Le prenom est obligatoire.';
    }

    if (this.nom.trim() === '') {
      this.erreurNom = 'Le nom est obligatoire.';
    }

    if (this.age === null || Number(this.age) < 13) {
      this.erreurAge = 'Vous devez avoir au moins 13 ans.';
    }

    if (this.email.trim() === '' || !this.email.includes('@')) {
      this.erreurEmail = 'L email doit etre valide.';
    }

    if (this.motDePasse.length < 6) {
      this.erreurMotDePasse = 'Le mot de passe doit avoir au moins 6 caracteres.';
    }

    if (this.photo === '') {
      this.erreurPhoto = 'Une photo est obligatoire.';
    }

    if (this.email.includes('@') && (await this.utilisateurs.emailDejaUtilise(this.email))) {
      this.erreurEmail = 'Cet email est deja utilise.';
    }

    return this.toutEstValide();
  }

  async sInscrire(): Promise<void> {
    if (this.envoi) {
      return;
    }

    if (!(await this.valider())) {
      this.message = 'Corrigez les champs en rouge avant de valider.';
      return;
    }

    this.envoi = true;

    try {
      const utilisateur = await this.utilisateurs.inscription(
        this.nom,
        this.prenom,
        Number(this.age),
        this.photo,
        this.email,
        this.motDePasse,
      );

      const toast = await this.toast.create({
        header: 'Compte cree',
        message: 'Bienvenue ' + utilisateur.prenom,
        duration: 1500,
        color: 'success',
      });

      await toast.present();
      await this.utilisateurs.seDeconnecter();

      this.router.navigateByUrl('/login');
    } catch {
      this.erreurEmail = 'Inscription impossible. Verifiez votre connexion internet.';
    } finally {
      this.envoi = false;
    }
  }
}