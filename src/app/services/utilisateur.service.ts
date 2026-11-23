import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Utilisateur } from '../models';
import { ApiService } from './api.service';

export interface ResultatConnexion {
  succes: boolean;
  message: string;
}

interface UtilisateurApi {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  photo: string;
  email: string;
  role: string;
  actif: boolean;
}

interface ReponseAuth {
  token: string;
  utilisateur: UtilisateurApi;
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private connecte: Utilisateur | null = null;
  private pret: Promise<void>;

  constructor(private api: ApiService) {
    this.pret = this.demarrer();
  }

  private depuisApi(source: UtilisateurApi): Utilisateur {
    return {
      id: String(source.id),
      nom: source.nom,
      prenom: source.prenom,
      age: source.age,
      photo: source.photo,
      email: source.email,
      role: source.role === 'admin' ? 'admin' : 'user',
      actif: source.actif,
    };
  }

  private async demarrer(): Promise<void> {
    const token = this.api.getToken();
    if (token === '') {
      return;
    }

    try {
      const data = await firstValueFrom(this.api.get<UtilisateurApi>('/moi'));
      this.connecte = this.depuisApi(data);
    } catch {
      this.api.effacerToken();
      this.connecte = null;
    }
  }

  async attendrePret(): Promise<void> {
    await this.pret;
  }

  getConnecte(): Utilisateur | null {
    return this.connecte;
  }

  estAdmin(): boolean {
    return this.connecte !== null && this.connecte.role === 'admin';
  }

  async emailDejaUtilise(email: string): Promise<boolean> {
    const utilisateurs = await this.getTous();
    return utilisateurs.some((u) => u.email === email);
  }

  async inscription(
    nom: string,
    prenom: string,
    age: number,
    photo: string,
    email: string,
    motDePasse: string,
  ): Promise<Utilisateur> {
    const reponse = await firstValueFrom(
      this.api.post<ReponseAuth>('/inscription', {
        nom: nom,
        prenom: prenom,
        age: age,
        photo: photo,
        email: email,
        motDePasse: motDePasse,
      }),
    );

    this.api.setToken(reponse.token);
    localStorage.setItem('django_email', email);
    this.connecte = this.depuisApi(reponse.utilisateur);

    return this.connecte;
  }

  async connexion(email: string, motDePasse: string): Promise<ResultatConnexion> {
    try {
      const reponse = await firstValueFrom(
        this.api.post<ReponseAuth>('/connexion', {
          email: email,
          motDePasse: motDePasse,
        }),
      );

      if (!reponse.utilisateur.actif) {
        this.api.effacerToken();
        return { succes: false, message: 'Ce compte a ete desactive par un administrateur.' };
      }

      this.api.setToken(reponse.token);
      localStorage.setItem('django_email', email);
      this.connecte = this.depuisApi(reponse.utilisateur);

      return { succes: true, message: '' };
    } catch {
      return { succes: false, message: 'Email ou mot de passe incorrect.' };
    }
  }

  async seDeconnecter(): Promise<void> {
    this.api.effacerToken();
    localStorage.removeItem('django_email');
    this.connecte = null;
  }

  async getTous(): Promise<Utilisateur[]> {
    const data = await firstValueFrom(this.api.get<UtilisateurApi[]>('/admin/utilisateurs'));
    return data.map((u) => this.depuisApi(u));
  }

  async getParId(id: string): Promise<Utilisateur | null> {
    const tous = await this.getTous();
    return tous.find((u) => u.id === id) ?? null;
  }

  async changerActif(id: string, actif: boolean): Promise<void> {
    const chemin = actif
      ? '/admin/utilisateurs/' + id + '/activer'
      : '/admin/utilisateurs/' + id + '/desactiver';

    await firstValueFrom(this.api.post<{ message: string }>(chemin, {}));

    if (this.connecte !== null && this.connecte.id === id) {
      this.connecte = { ...this.connecte, actif: actif };
    }
  }
}