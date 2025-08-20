import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '邮箱' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '用户密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '权限', enum: ['admin', 'user'] })
  @IsNotEmpty()
  @IsString()
  @IsIn(['admin', 'user'])
  permissions: string;
}

export class LoginDto {
  @ApiProperty({ description: '邮箱' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '用户密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: '是否记住' })
  @IsBoolean()
  @IsNotEmpty()
  remember: boolean;
}

export class UpdateUserDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '用户邮箱' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '主题' })
  @IsBoolean()
  isDark: boolean;

  @ApiProperty({ description: '语言' })
  @IsString()
  language: string;
}

export class UserDetailDto {
  @ApiProperty({ description: '用户ID' })
  @IsString()
  @IsNotEmpty()
  _id: string;
}
