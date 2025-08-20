import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/user/schema/user.schema';

@Schema({ versionKey: false, timestamps: true })
export class Group {
  @Prop()
  name: string; //名称

  @Prop()
  default: boolean; //是否默认

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    required: true,
  })
  users: mongoose.Types.ObjectId[]; // 或 User[]

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  owner: User; // 组的创建人，最高权限

  @Prop({ default: false })
  main: boolean; //当前选择的 账单

  @Prop({ default: false })
  isdelete: boolean;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
