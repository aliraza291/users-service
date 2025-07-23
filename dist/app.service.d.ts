import { SqsConsumerService } from './services/sqs-consumer';
export declare class AppService {
    private readonly sqsConsumerService;
    constructor(sqsConsumerService: SqsConsumerService);
    getHello(): Promise<string>;
}
