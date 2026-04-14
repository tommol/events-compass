import { Controller, Get } from '@nestjs/common';

@Controller({ version: '1' })
export class AppController {
  @Get()
  getRoot() {
    return {
      service: 'events-compass-api',
      status: 'ok',
      version: 'v1',
      docs: '/api/docs',
      basePath: '/api/v1',
    };
  }
}
