import { AppService } from './app.service';
import { SqsConsumerService } from './services/sqs-consumer';
export declare class AppController {
    private readonly appService;
    private readonly sqsConsumerService;
    constructor(appService: AppService, sqsConsumerService: SqsConsumerService);
    triggerPoll(): Promise<{
        message: string;
    }>;
    getHello(): string;
}
