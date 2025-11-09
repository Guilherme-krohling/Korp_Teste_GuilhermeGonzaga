import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Faturamento } from './pages/faturamento/faturamento'; // <-- 1. IMPORTE A NOVA PÁGINA

export const routes: Routes = [
    {
        path: '', // Página principal (Produtos)
        component: Home 
    },
    { // <-- 2. ADICIONE ESTE BLOCO
        path: 'faturamento', // O caminho (localhost:4200/faturamento)
        component: Faturamento // O componente que será carregado
    }
];