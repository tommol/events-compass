import { AuthService } from '../../auth.service';
import { LoginCommand } from '../login.command';
import { LoginHandler } from './login.handler';

describe('LoginHandler', () => {
  it('delegates login to AuthService', async () => {
    const authService = {
      login: jest.fn().mockReturnValue({
        accessToken: 'stub-token-user-example-com',
        expiresInSeconds: 3600,
        tokenType: 'Bearer',
      }),
    };

    const handler = new LoginHandler(authService as unknown as AuthService);
    const result = await handler.execute(new LoginCommand('user@example.com'));

    expect(authService.login).toHaveBeenCalledWith('user@example.com');
    expect(result).toEqual({
      accessToken: 'stub-token-user-example-com',
      expiresInSeconds: 3600,
      tokenType: 'Bearer',
    });
  });
});