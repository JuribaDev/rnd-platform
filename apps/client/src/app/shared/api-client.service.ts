import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';
import { LoginRequestDto, RegisterRequestDto, AuthResponseDto } from '../auth/dto/auth.dto';
import { PaginatedProductResponseDto } from '../product/dto/product.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  private getHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();

    return new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', 'application/json');
  }

  // Auth endpoints
  login(loginData: LoginRequestDto): Observable<AuthResponseDto> {
    console.log(`Making login request to: ${this.baseUrl}/auth/login`);

    return this.http.post<AuthResponseDto>(`${this.baseUrl}/auth/login`, loginData);
  }

  register(registerData: RegisterRequestDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/auth/register`, registerData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, { headers: this.getHeaders() });
  }

  // Product endpoints
  getProducts(page: number, limit: number): Observable<PaginatedProductResponseDto> {
    return this.http.get<PaginatedProductResponseDto>(
      `${this.baseUrl}/user/products`,
      {
        headers: this.getHeaders(),
        params: { page, limit }
      }
    );
  }

}
