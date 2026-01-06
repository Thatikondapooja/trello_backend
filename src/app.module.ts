import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from './user/user.module';
import { BoardController } from './board/board.controller';
import { BoardService } from './board/board.service';
import { BoardModule } from './board/board.module';
import { ListsService } from './list/list.service';
import { ListsController } from './list/list.controller';
import { ListModule } from './list/list.module';
import { CardsController } from './card/card.controller';
import { CardsService } from './card/card.service';
import { CardModule } from './card/card.module';
import { ActivityModule } from './activity/activity.module';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from "@nestjs/schedule";
import { MailModule } from './mail/mail.module';
import { ChecklistModule } from './checklist/checklist.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true, // dev only
    }),

    UserModule,

    BoardModule,

    ListModule,

    CardModule,

    ActivityModule,

    AuthModule,

    MailModule,

    ChecklistModule,

    
  ],
  controllers: [ AppController],
  providers: [AppService],
})
export class AppModule { }
