import { Routes } from '@angular/router';
import { MainComponent } from './main.component';

import { StaffDetailComponent } from '../shared/staff-detail/staff-detail.component';
import { TollStationComponent } from '../shared/toll-station/toll-station.component';
import { EditPasswordComponent } from '../shared/edit-password/edit-password.component';

export const MainRoutes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        redirectTo: 'tollStation',
        pathMatch: 'full'
      },
      {
        path: 'tollStation',
        component: TollStationComponent
      },
      {
        path: 'staff',
        loadChildren: './staff/staff.module#StaffModule'
      },
      {
        path: 'green',
        loadChildren: './green/green.module#GreenModule'
      },
      {
        path: 'staffDetail',
        component: StaffDetailComponent
      },
      {
        path: 'staffDetailInput',
        loadChildren: '../shared/staff-input/staff-input.module#StaffInputModule'
      },
      {
        path: 'tollStationInput',
        loadChildren: './toll-station-input/toll-station-input.module#TollStationInputModule'
      },
      {
        path: 'internal',
        loadChildren: '../shared/internal/internal.module#InternalModule'
      },
      {
        path: 'editPassword',
        component: EditPasswordComponent
      }
    ]
  }
];
