import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { AdminPageRoutingModule } from './admin-routing.module';
import { AdminPage } from './admin.page';

@NgModule({
  declarations: [AdminPage],
  imports: [CommonModule, FormsModule, IonicModule, AdminPageRoutingModule],
})
export class AdminPageModule {}