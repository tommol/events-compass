import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import type { LoginResponse } from '@events-compass/shared';

import { LoginCommand } from './commands/login.command';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @ApiOperation({ summary: 'Login endpoint (stub)' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Stub login response',
    schema: {
      example: {
        accessToken: 'stub-token-user-example-com',
        expiresInSeconds: 3600,
        tokenType: 'Bearer',
      },
    },
  })
  async login(@Body() payload: LoginDto): Promise<LoginResponse> {
    return this.commandBus.execute(new LoginCommand(payload.email));
  }
}
