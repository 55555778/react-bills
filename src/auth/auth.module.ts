// auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupService } from 'src/group/group.service';
import { Group, GroupSchema } from 'src/group/schema/group.schema';
import { ListService } from 'src/list/list.service';
import { List, ListSchema } from 'src/list/schema/list.schema';
import { Setting, SettingSchema } from 'src/setting/schema/setting.schema';
import { SettingService } from 'src/setting/setting.service';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'), // 默认值 '1h'
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: List.name, schema: ListSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GroupService,
    SettingService,
    ListService,
  ], // 👈 注册 JwtStrategy
  exports: [AuthService],
})
export class AuthModule {}
