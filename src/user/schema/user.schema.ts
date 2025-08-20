import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

@Schema({ versionKey: false, timestamps: true })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop({ default: '12345' })
  password: string;

  @Prop({ default: 'user' })
  permissions: string;

  @Prop({ default: true })
  isDark: boolean;

  @Prop({ default: 'zh-CN' })
  language: string;

  @Prop()
  wxOpenid: string;

  @Prop({ default: false })
  isdelete: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
