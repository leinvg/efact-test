import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'documentos',
    loadComponent: () =>
      import('./components/document-viewer/document-viewer.component').then(
        (m) => m.DocumentViewerComponent
      ),
    canActivate: [authGuard],
  },
];
