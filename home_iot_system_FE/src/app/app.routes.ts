import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { HomeComponent } from './home/home.component';
import { HistoryComponent } from './history/history.component';
import { StatisticsComponent } from './statistics/statistics.component';

export const routes: Routes = [
    {path :'profile',component : ProfileComponent},
    {path :'home',component : HomeComponent},
    {path :'history',component : HistoryComponent},
    {path :'statistics',component : StatisticsComponent},
    {path :'**',component : HomeComponent},
    {path :'',redirectTo:'/login', pathMatch :'full'}
];