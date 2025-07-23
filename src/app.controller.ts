import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { SqsConsumerService } from './services/sqs-consumer';

@Controller('poll')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly sqsConsumerService: SqsConsumerService,
  ) {}

  @Post()
  async triggerPoll() {
    await this.sqsConsumerService.startPolling();
    return { message: 'Polling triggered' };
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
