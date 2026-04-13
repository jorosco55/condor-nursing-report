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
        path: 'narcotics',
        loadComponent: () => import('../narcotics/narcotics.page').then(m => m.NarcoticsPage)
      },
      {
        path: 'meds',
        loadComponent: () => import('../meds/meds.page').then(m => m.MedsPage)
      },
      {
        path: 'special-circumstances',
        loadComponent: () => import('../special-circumstances/special-circumstances.page').then(m => m.SpecialCircumstancesPage)
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
