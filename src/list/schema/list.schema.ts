import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Group } from 'src/group/entities/group.entity';
import { Setting } from 'src/setting/schema/setting.schema';
import { User } from 'src/user/schema/user.schema';

@Schema({ versionKey: false, timestamps: true })
export class List {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'group', required: true })
  group: Group;

  @Prop()
  money: number; //金额

  @Prop()
  time: number; //时间

  @Prop()
  remark: string; //备注

  @Prop()
  type: string; //类型  支出/收入

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setting',
    required: true,
  })
  category: Setting; //l类别

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setting',
    required: true,
  })
  account: Setting; //账户

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setting',
  })
  shop: Setting; //商家

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Setting',
  })
  project: Setting; //项目

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ default: false })
  isdelete: boolean;
}
export const ListSchema = SchemaFactory.createForClass(List);
