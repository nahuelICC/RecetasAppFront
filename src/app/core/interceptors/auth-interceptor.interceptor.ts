// src/app/core/interceptors/auth-interceptor.interceptor.ts
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor que añade el token de autenticación y el username a las peticiones
 * @param request
 * @param next
 */
export const authInterceptorInterceptor = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const username = authService.getUsername();

  if (request.method !== 'OPTIONS' && token && username) {
    request = request.clone({
      headers: request.headers
        .set('Authorization', `Bearer ${token}`)
        .set('username', username)
    });

  }

  return next(request);
};
