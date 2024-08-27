import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withMethods, withState, patchState } from '@ngrx/signals';
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from './dto/auth.dto';
import { ApiClientService } from '../shared/api-client.service';
import { TokenService } from '../shared/token.service';

export interface AuthState {
  user: AuthResponseDto | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class AuthStore extends signalStore(
  withState(initialState),
  withMethods((store, apiClient = inject(ApiClientService), router = inject(Router), tokenService = inject(TokenService)) => ({
    login(loginData: LoginRequestDto) {
      patchState(store, { loading: true, error: null });
      apiClient.login(loginData).subscribe({
        next: (response) => {
          this.handleAuthSuccess(response);
        },
        error: (error) => patchState(store, { error:error.error.message[0].message ??
            error.error.message, loading: false }),
      });
    },

    register(registerData: RegisterRequestDto) {
      patchState(store, { loading: true, error: null });
      apiClient.register(registerData).subscribe({
        next: (response) => {
          this.handleAuthSuccess(response);
        },
        error: (error) => patchState(store, {error:error.error.message[0].message ??
             error.error.message, loading: false }),
      });
    },

    logout() {
      apiClient.logout().subscribe({
        next: () => {
          this.handleLogout();
        },
        error: (error) => {
          this.handleLogout();
        },
      });
    },

    isAuthenticated(): boolean {
      return !!tokenService.getToken();
    },

    handleAuthSuccess(response: AuthResponseDto) {
      tokenService.setToken(response.token.token);
      patchState(store, { user: response, loading: false });
      router.navigate(['/product']);
    },

    handleLogout() {
      tokenService.removeToken();
      patchState(store, initialState);
      router.navigate(['/login']);
    },
  }))
) {}
