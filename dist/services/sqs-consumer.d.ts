import { OnModuleInit } from '@nestjs/common';
import { UsersService } from '../modules/users/users.service';
export declare class SqsConsumerService implements OnModuleInit {
    private readonly usersService;
    private sqs;
    private readonly queueUrl;
    constructor(usersService: UsersService);
    onModuleInit(): void;
    startPolling(): Promise<void>;
    private processMessage;
    private sendResponse;
}
