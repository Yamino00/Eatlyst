import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.loading$.pipe(
      filter(loading => !loading), // Wait until loading is complete
      take(1),
      switchMap(() => this.authService.isAuthenticated$),
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.loading$.pipe(
      filter(loading => !loading), // Wait until loading is complete
      take(1),
      switchMap(() => this.authService.isAuthenticated$),
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return true;
        } else {
          return this.router.createUrlTree(['/tabs']);
        }
      })
    );
  }
}