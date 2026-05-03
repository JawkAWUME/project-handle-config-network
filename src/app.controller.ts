import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  @Public() // si vous utilisez un guard global JWT, rendre cette route publique
  @Get()
  getRoot() {
    return {
      message: 'NetConfig API is running',
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
  }
}