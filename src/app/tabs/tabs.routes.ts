import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const TABS_ROUTES: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'report',
        loadComponent: () => import('../home/home.page').then(m => m.HomePage)
      },
      {
        path: 'export',
        loadComponent: () => import('../export/export.page').then(m => m.ExportPage)
      },
      {
        path: '',
        redirectTo: '/tabs/report',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/report',
    pathMatch: 'full'
  }
];
