import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SqsConsumerService } from '../../services/sqs-consumer';


@Module({
  providers: [UsersService, SqsConsumerService],
})
export class UsersModule {}