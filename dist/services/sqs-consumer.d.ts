import { UsersService } from '../modules/users/users.service';
export declare class SqsConsumerService {
    private readonly usersService;
    private sqs;
    private readonly queueUrl;
    constructor(usersService: UsersService);
    handleCron(): void;
    startPolling(): Promise<void>;
    private processMessage;
    private sendResponse;
}
