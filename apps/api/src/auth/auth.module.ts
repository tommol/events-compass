import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginHandler } from './commands/handlers/login.handler';

@Module({
  imports: [CqrsModule],
  controllers: [AuthController],
  providers: [AuthService, LoginHandler],
})
export class AuthModule {}
