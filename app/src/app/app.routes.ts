import { Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { FoodTypeComponent } from './pages/food-type/food-type.component';
import { FoodSizeComponent } from './pages/food-size/food-size.component';
import { TasteComponent } from './pages/taste/taste.component';
import { FoodComponent } from './pages/food/food.component';
import { SaleComponent } from './pages/sale/sale.component';
import { OrganizationComponent } from './pages/organization/organization.component';
import { BillSaleComponent } from './pages/bill-sale/bill-sale.component';
import { ReportSaleComponent } from './pages/report-sale/report-sale.component';
import { ReportSalePerMonthComponent } from './pages/report-sale-per-month/report-sale-per-month.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UserComponent } from './pages/user/user.component';

import { AuthGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: SignInComponent,
  },
  {
    path: 'foodtype',
    component: FoodTypeComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'foodsize',
    component: FoodSizeComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'taste',
    component: TasteComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'food',
    component: FoodComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'sale',
    component: SaleComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'EMPLOYEE' },
  },
  {
    path: 'organization',
    component: OrganizationComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'bill-sale',
    component: BillSaleComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'reportSale',
    component: ReportSaleComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'reportSalePerMonth',
    component: ReportSalePerMonthComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { requiredLevel: 'ADMIN' },
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
