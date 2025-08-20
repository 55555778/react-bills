import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Setting } from './entities/setting.entity';
import { SettingSchema } from './schema/setting.schema';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }]),
  ],
  controllers: [SettingController],
  providers: [SettingService],
})
export class SettingModule {}
