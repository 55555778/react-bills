import { IsNotEmpty, IsString } from 'class-validator';

export class FindGroupDto {
  @IsNotEmpty({ message: '输入用户id' })
  @IsString()
  user: string;
}

export class CreateGroupDto {
  @IsNotEmpty({ message: '请输入名称' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: '请输入用户id' })
  @IsString()
  user: string;
}

export class DeleteGroupDto {
  @IsNotEmpty({ message: '请输入账单id' })
  @IsString()
  _id: string;
}

export class SearchGroupDto {
  @IsNotEmpty({ message: '请输入搜索内容' })
  @IsString()
  name: string;
}

export class JoinGroupDto {
  @IsNotEmpty({ message: '请输入账本id' })
  @IsString()
  group: string;

  @IsNotEmpty({ message: '请输入用户id' })
  @IsString()
  user: string;
}

export class SwitchGroupDto {
  @IsNotEmpty({ message: '请输入账本id' })
  @IsString()
  _id: string;

  @IsNotEmpty({ message: '请输入用户id' })
  @IsString()
  user: string;
}
