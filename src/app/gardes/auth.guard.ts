import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { UtilisateurService } from '../services/utilisateur.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanLoad {
  constructor(
    private router: Router,
    private utilisateurs: UtilisateurService,
  ) {}

  async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    await this.utilisateurs.attendrePret();

    if (this.utilisateurs.getConnecte() !== null) {
      return true;
    }

    this.router.navigateByUrl('/login');
    return false;
  }
}