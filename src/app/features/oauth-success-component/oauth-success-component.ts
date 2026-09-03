import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  imports: [],
  selector: 'app-oauth-success-component',
  templateUrl: './oauth-success-component.html',
})
export class OauthSuccessComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {

    const token = this.route.snapshot.queryParamMap.get('token');
    const refreshToken = this.route.snapshot.queryParamMap.get('refreshToken');

    if (!token || !refreshToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.setToken(token, refreshToken);

    this.router.navigate(['/drive/my-drive'], {
      replaceUrl: true
    });
  }
}
