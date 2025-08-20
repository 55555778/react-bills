import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Group } from 'src/group/schema/group.schema';

@Schema({ versionKey: false, timestamps: true })
export class Setting {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'group', required: true })
  group: Group;

  @Prop()
  type: string; //大类别 支出 收入 商家 账户

  @Prop()
  category: string; //子类别

  @Prop()
  name: string; // 子类别

  @Prop({ default: 0 })
  money: number;

  @Prop({ default: false })
  isdelete: boolean;

  @Prop({ type: Array, of: String })
  children: string[];

  @Prop()
  parent: string;
}
export const SettingSchema = SchemaFactory.createForClass(Setting);
