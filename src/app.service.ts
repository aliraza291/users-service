import { Injectable } from '@nestjs/common';
import { SqsConsumerService } from './services/sqs-consumer';

@Injectable()
export class AppService {
  constructor(    private readonly sqsConsumerService: SqsConsumerService){}
  async getHello(): Promise<string> {
    await this.sqsConsumerService.onModuleInit()
    return 'Hello World!';
  }
}
