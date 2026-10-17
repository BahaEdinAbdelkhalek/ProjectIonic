import { Injectable } from '@angular/core';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { COMPTES_DEMO, CompteDemo, filmsDepuisIds } from '../donnees';
import { Role, Utilisateur } from '../models';
import { FavorisService } from './favoris.service';
import { FirebaseService } from './firebase.service';

const COLLECTION = 'utilisateurs';

export interface ResultatConnexion {
  succes: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private connecte: Utilisateur | null = null;
  private pret: Promise<void>;

  constructor(
    private firebase: FirebaseService,
    private favorisService: FavorisService,
  ) {
    this.pret = this.demarrer();
  }

  private async demarrer(): Promise<void> {
    if (!this.firebase.estConfigure()) {
      return;
    }

    await this.semenerSiVide();

    await new Promise<void>((resolve) => {
      onAuthStateChanged(this.firebase.auth, (user) => {
        void this.appliquerEtat(user).finally(() => resolve());
      });
    });
  }

  async attendrePret(): Promise<void> {
    await this.pret;
  }

  private async semenerSiVide(): Promise<void> {
    const existants = await getDocs(collection(this.firebase.db, COLLECTION));

    if (existants.size > 0) {
      return;
    }

    for (const demo of COMPTES_DEMO) {
      await this.creerCompteDemo(demo);
    }

    await signOut(this.firebase.auth);
  }

  private async creerCompteDemo(demo: CompteDemo): Promise<void> {
    const uid = await this.obtenirUid(demo.email, demo.motDePasse);

    await setDoc(doc(this.firebase.db, COLLECTION, uid), {
      id: uid,
      nom: demo.nom,
      prenom: demo.prenom,
      age: demo.age,
      photo: demo.photo,
      email: demo.email,
      role: demo.role,
      actif: demo.actif,
    });

    await this.favorisService.remplacer(uid, filmsDepuisIds(demo.favoris));
  }

  private async obtenirUid(email: string, motDePasse: string): Promise<string> {
    try {
      const cree = await createUserWithEmailAndPassword(
        this.firebase.auth,
        email,
        motDePasse,
      );
      return cree.user.uid;
    } catch {
      const existant = await signInWithEmailAndPassword(
        this.firebase.auth,
        email,
        motDePasse,
      );
      return existant.user.uid;
    }
  }

  private async appliquerEtat(user: User | null): Promise<void> {
    if (user === null) {
      this.connecte = null;
      return;
    }

    this.connecte = await this.getParId(user.uid);
  }

  private depuisDocument(id: string, data: Record<string, unknown>): Utilisateur {
    return {
      id: id,
      nom: String(data['nom'] ?? ''),
      prenom: String(data['prenom'] ?? ''),
      age: Number(data['age'] ?? 0),
      photo: String(data['photo'] ?? ''),
      email: String(data['email'] ?? ''),
      role: (data['role'] === 'admin' ? 'admin' : 'user') as Role,
      actif: data['actif'] === true,
    };
  }

  async getTous(): Promise<Utilisateur[]> {
    const resultat = await getDocs(collection(this.firebase.db, COLLECTION));
    const utilisateurs: Utilisateur[] = [];

    resultat.forEach((document) => {
      utilisateurs.push(this.depuisDocument(document.id, document.data()));
    });

    return utilisateurs;
  }

  async getParId(id: string): Promise<Utilisateur | null> {
    const document = await getDoc(doc(this.firebase.db, COLLECTION, id));

    if (!document.exists()) {
      return null;
    }

    return this.depuisDocument(document.id, document.data());
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
    const cree = await createUserWithEmailAndPassword(
      this.firebase.auth,
      email,
      motDePasse,
    );

    const id = cree.user.uid;

    const nouveau: Utilisateur = {
      id: id,
      nom: nom,
      prenom: prenom,
      age: age,
      photo: photo,
      email: email,
      role: 'user',
      actif: true,
    };

    await setDoc(doc(this.firebase.db, COLLECTION, id), nouveau);
    await this.favorisService.remplacer(id, []);
    await this.appliquerEtat(cree.user);
    return nouveau;
  }

  async connexion(email: string, motDePasse: string): Promise<ResultatConnexion> {
    let utilisateurFirebase: User;

    try {
      const resultat = await signInWithEmailAndPassword(
        this.firebase.auth,
        email,
        motDePasse,
      );
      utilisateurFirebase = resultat.user;
    } catch {
      return { succes: false, message: 'Email ou mot de passe incorrect.' };
    }

    await this.appliquerEtat(utilisateurFirebase);

    if (this.connecte === null) {
      await signOut(this.firebase.auth);
      return { succes: false, message: 'Profil introuvable.' };
    }

    if (!this.connecte.actif) {
      await signOut(this.firebase.auth);
      this.connecte = null;
      return {
        succes: false,
        message: 'Ce compte a ete desactive par un administrateur.',
      };
    }

    return { succes: true, message: '' };
  }

  async seDeconnecter(): Promise<void> {
    await signOut(this.firebase.auth);
    this.connecte = null;
  }

  getConnecte(): Utilisateur | null {
    return this.connecte;
  }

  estAdmin(): boolean {
    return this.connecte !== null && this.connecte.role === 'admin';
  }

  async changerActif(id: string, actif: boolean): Promise<void> {
    await updateDoc(doc(this.firebase.db, COLLECTION, id), { actif: actif });

    if (this.connecte !== null && this.connecte.id === id) {
      this.connecte = { ...this.connecte, actif: actif };
    }
  }
}