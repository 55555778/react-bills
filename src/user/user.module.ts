import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { Group } from 'src/group/entities/group.entity';
import { GroupService } from 'src/group/group.service';
import { GroupSchema } from 'src/group/schema/group.schema';
import { Setting, SettingSchema } from 'src/setting/schema/setting.schema';
import { SettingModule } from 'src/setting/setting.module';
import { SettingService } from 'src/setting/setting.service';
import { User, UserSchema } from './schema/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: Group.name, schema: GroupSchema },
    ]),
    AuthModule,
    SettingModule,
  ],
  controllers: [UserController],
  providers: [UserService, SettingService, GroupService],
  exports: [UserService],
})
export class UserModule {}
