import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { SqsConsumerService } from './services/sqs-consumer';
import { UsersService } from './modules/users/users.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  
  imports: [UsersModule, ScheduleModule.forRoot(),],
  controllers: [AppController],
  providers: [AppService,SqsConsumerService],
})
export class AppModule {}
