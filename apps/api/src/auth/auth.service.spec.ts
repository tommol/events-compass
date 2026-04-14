import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('should create stub token from email', () => {
    const service = new AuthService();

    expect(service.login('User.Name@example.com')).toEqual({
      accessToken: 'stub-token-user-name-example-com',
      expiresInSeconds: 3600,
      tokenType: 'Bearer',
    });
  });
});
