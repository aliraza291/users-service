"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsConsumerService = void 0;
const common_1 = require("@nestjs/common");
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const users_service_1 = require("../modules/users/users.service");
let SqsConsumerService = class SqsConsumerService {
    constructor(usersService) {
        this.usersService = usersService;
        this.queueUrl = process.env.USERS_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/account/users-queue';
        this.sqs = new aws_sdk_1.SQS({
            region: process.env.AWS_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }
    onModuleInit() {
        this.startPolling();
    }
    async startPolling() {
        console.log('Starting SQS polling for users queue...');
        try {
            const params = {
                QueueUrl: this.queueUrl,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20,
                MessageAttributeNames: ['All']
            };
            const result = await this.sqs.receiveMessage(params).promise();
            if (result.Messages && result.Messages.length > 0) {
                for (const message of result.Messages) {
                    await this.processMessage(message);
                    await this.sqs.deleteMessage({
                        QueueUrl: this.queueUrl,
                        ReceiptHandle: message.ReceiptHandle
                    }).promise();
                }
            }
        }
        catch (error) {
            console.error('Error polling SQS:', error);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    async processMessage(message) {
        try {
            const event = JSON.parse(message.Body);
            const replyTo = message.MessageAttributes?.replyTo?.StringValue;
            console.log('Processing event:', event);
            console.log('Reply to:', replyTo);
            let result;
            let success = true;
            let errorMessage = '';
            switch (event.type) {
                case 'USER_CREATE':
                    try {
                        result = await this.usersService.createUser(event.data);
                        console.log('User created:', result);
                    }
                    catch (error) {
                        success = false;
                        errorMessage = error.message;
                        console.error('Error creating user:', error);
                    }
                    break;
                case 'USER_GET':
                    try {
                        result = await this.usersService.getUserById(event.data.id);
                        if (!result) {
                            success = false;
                            errorMessage = 'User not found';
                        }
                        console.log('User retrieved:', result);
                    }
                    catch (error) {
                        success = false;
                        errorMessage = error.message;
                        console.error('Error retrieving user:', error);
                    }
                    break;
                case 'USER_UPDATE':
                    try {
                        const { id, ...updateData } = event.data;
                        result = await this.usersService.updateUser(id, updateData);
                        if (!result) {
                            success = false;
                            errorMessage = 'User not found';
                        }
                        console.log('User updated:', result);
                    }
                    catch (error) {
                        success = false;
                        errorMessage = error.message;
                        console.error('Error updating user:', error);
                    }
                    break;
                case 'USER_DELETE':
                    try {
                        const deleted = await this.usersService.deleteUser(event.data.id);
                        result = { deleted };
                        if (!deleted) {
                            success = false;
                            errorMessage = 'User not found';
                        }
                        console.log('User deleted:', deleted);
                    }
                    catch (error) {
                        success = false;
                        errorMessage = error.message;
                        console.error('Error deleting user:', error);
                    }
                    break;
                default:
                    console.log('Unknown event type:', event.type);
                    return;
            }
            if (replyTo) {
                const response = {
                    correlationId: event.correlationId,
                    success,
                    data: result,
                    errorMessage,
                    timestamp: new Date().toISOString(),
                    eventType: event.type
                };
                await this.sendResponse(replyTo, response);
                console.log('Response sent back to API Gateway');
            }
            else {
                console.warn('No replyTo queue specified in message');
            }
        }
        catch (error) {
            console.error('Error processing message:', error);
        }
    }
    async sendResponse(replyQueueUrl, response) {
        try {
            const params = {
                QueueUrl: replyQueueUrl,
                MessageBody: JSON.stringify(response),
                MessageAttributes: {
                    correlationId: {
                        DataType: 'String',
                        StringValue: response.correlationId
                    },
                    eventType: {
                        DataType: 'String',
                        StringValue: response.eventType
                    }
                }
            };
            const result = await this.sqs.sendMessage(params).promise();
            console.log('Response sent successfully:', {
                correlationId: response.correlationId,
                messageId: result.MessageId
            });
        }
        catch (error) {
            console.error('Error sending response:', error);
            throw error;
        }
    }
};
exports.SqsConsumerService = SqsConsumerService;
exports.SqsConsumerService = SqsConsumerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], SqsConsumerService);
//# sourceMappingURL=sqs-consumer.js.map