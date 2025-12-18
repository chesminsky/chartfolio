import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';
import { CryptoPriceResolver } from './core/resolvers/crypto-resolver';
import { StockPriceResolver } from './core/resolvers/stocks-resolver';

import { StockMoexPriceResolver } from './core/resolvers/stocks-moex-resolver';
import { DonationComponent } from './pages/donation/donation.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';

const routes: Routes = [
  {
    path: '',
    resolve: {
      stockPrices: StockPriceResolver,
      stockMoexPrices: StockMoexPriceResolver,
      cryptos: CryptoPriceResolver
    },
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadChildren: () => import('./pages/overview/overview.module').then(m => m.OverviewModule)
      },
      {
        path: 'dividends',
        loadChildren: () => import('./pages/dividends/dividends.module').then(m => m.DividendsModule)
      },
      {
        path: 'portfolios',
        loadChildren: () => import('./pages/portfolio/portfolio.module').then(m => m.PortfolioModule)
      },
      {
        path: 'categories',
        loadChildren: () => import('./pages/categories/categories.module').then(m => m.CategoriesModule)
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: marker('anms.menu.login') }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: marker('anms.menu.register') }
  },
  {
    path: 'donation',
    component: DonationComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: '**',
    redirectTo: 'overview'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    preloadingStrategy: PreloadAllModules
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
