import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SqsConsumerService } from '../../services/sqs-consumer';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ScheduleModule.forRoot()],

  providers: [UsersService, SqsConsumerService],
})
export class UsersModule {}
