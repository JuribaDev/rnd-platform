import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login.component';
import { RegisterComponent } from './auth/components/register.component';
import { ProductListComponent } from './product/components/product-list.component';
import { authGuard } from './auth/guards/auth.guard';
import { inject } from '@angular/core';
import { AuthStore } from './auth/auth.store';
import { Router } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/product', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'product', component: ProductListComponent, canActivate: [authGuard] },
  {
    path: '**',
    canActivate: [() => {
      const authStore = inject(AuthStore);
      const router = inject(Router);

      if (authStore.isAuthenticated()) {
        router.navigate(['/product']);
      } else {
        router.navigate(['/login']);
      }
      return false;
    }],
    component: ProductListComponent
  }
];
