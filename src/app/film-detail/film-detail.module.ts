import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { FilmDetailPageRoutingModule } from './film-detail-routing.module';
import { FilmDetailPage } from './film-detail.page';

@NgModule({
  declarations: [FilmDetailPage],
  imports: [CommonModule, FormsModule, IonicModule, FilmDetailPageRoutingModule],
})
export class FilmDetailPageModule {}