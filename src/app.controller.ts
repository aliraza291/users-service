import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SqsConsumerService } from './services/sqs-consumer';

@Controller('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }
}
