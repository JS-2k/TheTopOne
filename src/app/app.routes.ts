import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { AboutComponent } from './components/about/about';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'leaderboard', loadComponent: () => import('./components/leaderboard-page/leaderboard-page').then(m => m.LeaderboardPageComponent) },
    { path: '**', redirectTo: '' }
];
