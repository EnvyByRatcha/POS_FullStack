import { inject, Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // console.log(route.data['requiredLevel']);

    return this.authService.getUserLevelFromToken().pipe(
      map((level) => {
        const requiredLevel = route.data['requiredLevel'];
        if (this.checkPermission(level.level, requiredLevel)) {
          return true;
        } else {
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/login']);
        return [false];
      })
    );
  }

  private checkPermission(userLevel: string, requiredLevel: string): boolean {
    if (requiredLevel === 'ADMIN' && userLevel === 'ADMIN') {
      return true;
    }
    if (
      requiredLevel === 'EMPLOYEE' &&
      (userLevel === 'EMPLOYEE' || userLevel === 'ADMIN')
    ) {
      return true;
    }
    return false;
  }
}
