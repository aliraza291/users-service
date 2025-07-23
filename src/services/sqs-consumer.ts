import { Injectable, OnModuleInit } from '@nestjs/common';
import { SQS } from 'aws-sdk';
import { config } from 'dotenv';
config();
import { UsersService } from '../modules/users/users.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SqsConsumerService  {
  private sqs: SQS;
  private readonly queueUrl =
    process.env.USERS_QUEUE_URL ||
    'https://sqs.us-east-1.amazonaws.com/account/users-queue';

  constructor(private readonly usersService: UsersService) {
    this.sqs = new SQS({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
  @Cron('5 * * * * *')
  handleCron() {
    console.log("tasks started.............")
    this.startPolling();
  }

  async startPolling() {
    console.log('Starting SQS polling for users queue...');

    try {
      const params = {
        QueueUrl: this.queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
        MessageAttributeNames: ['All'],
      };

      const result = await this.sqs.receiveMessage(params).promise();

      if (result.Messages && result.Messages.length > 0) {
        for (const message of result.Messages) {
          await this.processMessage(message);

          // Delete message after processing
          await this.sqs
            .deleteMessage({
              QueueUrl: this.queueUrl,
              ReceiptHandle: message.ReceiptHandle!,
            })
            .promise();
        }
      }
    } catch (error) {
      console.error('Error polling SQS:', error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  private async processMessage(message: any) {
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
          } catch (error) {
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
          } catch (error) {
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
          } catch (error) {
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
          } catch (error) {
            success = false;
            errorMessage = error.message;
            console.error('Error deleting user:', error);
          }
          break;

        default:
          console.log('Unknown event type:', event.type);
          return;
      }

      // Send response back to API Gateway
      if (replyTo) {
        const response = {
          correlationId: event.correlationId,
          success,
          data: result,
          errorMessage,
          timestamp: new Date().toISOString(),
          eventType: event.type,
        };

        await this.sendResponse(replyTo, response);
        console.log('Response sent back to API Gateway');
      } else {
        console.warn('No replyTo queue specified in message');
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  private async sendResponse(replyQueueUrl: string, response: any) {
    try {
      const params = {
        QueueUrl: replyQueueUrl,
        MessageBody: JSON.stringify(response),
        MessageAttributes: {
          correlationId: {
            DataType: 'String',
            StringValue: response.correlationId,
          },
          eventType: {
            DataType: 'String',
            StringValue: response.eventType,
          },
        },
      };

      const result = await this.sqs.sendMessage(params).promise();
      console.log('Response sent successfully:', {
        correlationId: response.correlationId,
        messageId: result.MessageId,
      });
    } catch (error) {
      console.error('Error sending response:', error);
      throw error;
    }
  }
}
