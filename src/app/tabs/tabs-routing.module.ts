import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FavorisPage } from '../favoris/favoris.page';
import { FilmsPage } from '../films/films.page';
import { MatchingPage } from '../matching/matching.page';
import { ProfilPage } from '../profil/profil.page';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      { path: '', redirectTo: 'films', pathMatch: 'full' },
      { path: 'films', component: FilmsPage },
      { path: 'favoris', component: FavorisPage },
      { path: 'matching', component: MatchingPage },
      { path: 'profil', component: ProfilPage },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}