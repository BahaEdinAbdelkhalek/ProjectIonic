import { Injectable } from '@angular/core';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { CONFIG } from '../config';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private appInstance: FirebaseApp | null = null;
  private authInstance: Auth | null = null;
  private dbInstance: Firestore | null = null;

  constructor() {
    if (!this.estConfigure()) {
      return;
    }

    if (getApps().length > 0) {
      this.appInstance = getApp();
    } else {
      this.appInstance = initializeApp(CONFIG.firebase);
    }

    this.authInstance = getAuth(this.appInstance);
    this.dbInstance = getFirestore(this.appInstance);
  }

  estConfigure(): boolean {
    return CONFIG.firebase.apiKey.trim() !== '';
  }

  get auth(): Auth {
    if (this.authInstance === null) {
      throw new Error('Firebase Auth non configure. Renseignez CONFIG.firebase dans config.ts.');
    }

    return this.authInstance;
  }

  get db(): Firestore {
    if (this.dbInstance === null) {
      throw new Error('Firestore non configure. Renseignez CONFIG.firebase dans config.ts.');
    }

    return this.dbInstance;
  }
}