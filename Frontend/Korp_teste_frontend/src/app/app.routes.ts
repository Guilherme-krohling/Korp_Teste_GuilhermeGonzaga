import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Faturamento } from './pages/faturamento/faturamento';

export const routes: Routes = [
    {
        path: '',
        component: Home 
    },
    {
        path: 'faturamento',
        component: Faturamento
    }
];