import { Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage),
    canActivate: [NoAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then( m => m.RegisterPage),
    canActivate: [NoAuthGuard]
  },  {
    path: 'add-recipe',
    loadComponent: () => import('./pages/add-recipe/add-recipe.page').then( m => m.AddRecipePage)
  },

];
