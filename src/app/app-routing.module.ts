import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './gardes/admin.guard';
import { AuthGuard } from './gardes/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'inscription',
    loadChildren: () => import('./register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'tabs',
    canLoad: [AuthGuard],
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'film/:id',
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./film-detail/film-detail.module').then((m) => m.FilmDetailPageModule),
  },
  {
    path: 'admin',
    canLoad: [AuthGuard, AdminGuard],
    loadChildren: () => import('./admin/admin.module').then((m) => m.AdminPageModule),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}