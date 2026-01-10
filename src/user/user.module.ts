import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Card } from 'src/card/card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User,Card])],
  controllers: [UserController],
  providers: [UserService],
   exports: [TypeOrmModule], // ✅ IMPORTANT //this is because export repository to other modules

})
export class UserModule {}
