import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { LoginResponse } from '@events-compass/shared';

import { AuthService } from '../../auth.service';
import { LoginCommand } from '../login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, LoginResponse> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LoginCommand): Promise<LoginResponse> {
    return this.authService.login(command.email);
  }
}
