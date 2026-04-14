import { Injectable } from '@nestjs/common';
import type { LoginResponse } from '@events-compass/shared';

@Injectable()
export class AuthService {
  login(email: string): LoginResponse {
    const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    return {
      accessToken: `stub-token-${sanitizedEmail}`,
      expiresInSeconds: 3600,
      tokenType: 'Bearer',
    };
  }
}
