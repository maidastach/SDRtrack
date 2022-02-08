import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'dashboard',
        children: [
          {
            path: '',
            loadChildren: () => import('../Modules/dashboard/dashboard.module').then(m => m.DashboardModule)
          }
        ]
      },
      {
        path: 'today',
        children: [
          {
            path: '',
            loadChildren: () => import('../Modules/today/today.module').then(m => m.TodayModule)
          }
        ]
      },
      {
        path: 'details',
        children: [
          {
            path: '',
            loadChildren: () => import('../Modules/details/details.module').then(m => m.DetailsModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
