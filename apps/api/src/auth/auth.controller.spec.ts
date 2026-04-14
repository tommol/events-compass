import { CommandBus } from '@nestjs/cqrs';

import { LoginCommand } from './commands/login.command';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  it('dispatches a login command and returns the response', async () => {
    const commandBus = {
      execute: jest.fn().mockResolvedValue({
        accessToken: 'stub-token-user-example-com',
        expiresInSeconds: 3600,
        tokenType: 'Bearer',
      }),
    };

    const controller = new AuthController(commandBus as unknown as CommandBus);
    const result = await controller.login({
      email: 'user@example.com',
      password: 'super-secret-password',
    });

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(LoginCommand));
    const command = commandBus.execute.mock.calls[0][0] as LoginCommand;
    expect(command.email).toBe('user@example.com');
    expect(result).toEqual({
      accessToken: 'stub-token-user-example-com',
      expiresInSeconds: 3600,
      tokenType: 'Bearer',
    });
  });
});