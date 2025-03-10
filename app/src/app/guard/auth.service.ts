import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import config from '../../config';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserLevelFromToken(): Observable<any> {
    return this.http.get(`${config.apiPath}/api/user/getLevelFromToken`, {
      headers: { Authorization: `Bearer ${this.getToken()}` },
    });
  }
}
