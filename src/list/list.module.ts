import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingSchema } from 'src/setting/schema/setting.schema';
import { ListController } from './list.controller';
import { ListService } from './list.service';
import { ListSchema } from './schema/list.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'List', schema: ListSchema },
      { name: 'Setting', schema: SettingSchema },
    ]),
  ],
  controllers: [ListController],
  providers: [ListService],
})
export class ListModule {}
