import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ListService } from 'src/list/list.service';
import { List, ListSchema } from 'src/list/schema/list.schema';
import { Setting } from 'src/setting/entities/setting.entity';
import { SettingSchema } from 'src/setting/schema/setting.schema';
import { SettingService } from 'src/setting/setting.service';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { Group, GroupSchema } from './schema/group.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: List.name, schema: ListSchema },
    ]),
  ],
  controllers: [GroupController],
  providers: [GroupService, SettingService, ListService],
})
export class GroupModule {}
