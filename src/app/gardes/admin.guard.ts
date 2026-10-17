import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { UtilisateurService } from '../services/utilisateur.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanLoad {
  constructor(
    private router: Router,
    private utilisateurs: UtilisateurService,
  ) {}

  async canLoad(route: Route, segments: UrlSegment[]): Promise<boolean> {
    await this.utilisateurs.attendrePret();

    if (this.utilisateurs.estAdmin()) {
      return true;
    }

    this.router.navigateByUrl('/tabs/films');
    return false;
  }
}