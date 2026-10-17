import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { FavorisPage } from '../favoris/favoris.page';
import { FilmsPage } from '../films/films.page';
import { MatchingPage } from '../matching/matching.page';
import { ProfilPage } from '../profil/profil.page';
import { TabsPageRoutingModule } from './tabs-routing.module';
import { TabsPage } from './tabs.page';

@NgModule({
  declarations: [TabsPage, FilmsPage, FavorisPage, MatchingPage, ProfilPage],
  imports: [CommonModule, FormsModule, IonicModule, TabsPageRoutingModule],
})
export class TabsPageModule {}