import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Group } from 'src/group/entities/group.entity';
import { User } from 'src/user/schema/user.schema';

@Schema({ versionKey: false, timestamps: true })
export class Budget {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'group', required: true })
  group: Group;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true })
  user: User;

  @Prop()
  money: number; //金额

  @Prop()
  time: number; //时间

  @Prop()
  remark: string; //备注

  @Prop()
  type: string; //类型  支出/收入

  @Prop({ default: false })
  isdelete: boolean;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
