// import { Routes } from '@angular/router';

// export const routes: Routes = [];


import { Routes } from '@angular/router';
import { Home } from './pages/home/home'; // Importa seu componente

export const routes: Routes = [
    {
        path: '', // O "caminho" raiz (localhost:4200)
        component: Home // O componente que deve ser carregado
    }
];