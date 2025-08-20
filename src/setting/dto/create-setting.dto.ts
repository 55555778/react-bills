import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class FindDto {
  @ApiProperty({ description: '类型' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  _id: string;
}

export class CreateSettingDto {
  @ApiProperty({ description: '是否是父类' })
  @IsNotEmpty()
  @IsNumber()
  level: number;

  @ApiProperty({ description: '类型' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: '子类别' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({ description: '品类Id' })
  @IsString()
  @IsOptional()
  _id: string;
}

export class CreateOptionsDto {
  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty({ description: '类型' })
  @IsNotEmpty()
  @IsString()
  type: string;
}

export class SwitchSettingDto {
  @ApiProperty({ description: '选项Id' })
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty({ description: '账本' })
  @IsNotEmpty()
  @IsString()
  group: string;
}

export class GetCategoryListDto {
  @ApiProperty({ description: '类型' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  user: string;
}
