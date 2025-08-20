import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateListDto {
  @IsNotEmpty({ message: '请输入账单——id' })
  @IsString()
  group: string;

  @IsNotEmpty({ message: '请输入金额' })
  @IsNumber()
  money: number;

  @IsNotEmpty({ message: '请输入分类' })
  @IsString({ message: '请输入分类' })
  category: string;

  @IsNotEmpty({ message: '账户' })
  @IsString({ message: '请输入账户' })
  account: string;

  @IsNotEmpty()
  @IsNumber()
  time: number;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  shop: string;

  @IsOptional()
  @IsString()
  remark: string;

  @IsOptional()
  @IsString()
  project: string;

  @IsNotEmpty()
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  _id: string;
}

export class ChartDto {
  @IsNotEmpty()
  @IsString()
  user: string;
}

export class FindListDto {
  @ApiProperty({ description: '获取个数' })
  @IsOptional()
  @IsNumber()
  size: number;

  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({ description: '流水类型' })
  @IsOptional()
  @IsString()
  type: string;

  @ApiProperty({ description: '时间' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true }) // 确保每个元素是 number
  @ArrayMinSize(2)
  @ArrayMaxSize(2) // 假设是起止时间
  time: number[];

  @ApiProperty({ description: '分类' })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true }) // 确保每个元素是 string
  category: string[];

  @ApiProperty({ description: '账户' })
  @IsOptional()
  @IsArray()
  @Type(() => String)
  @IsString({ each: true })
  account: string[];

  @ApiProperty({ description: '金额区间' })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  money: number[] | null[];
}

export class DeleteDto {
  @ApiProperty({ description: '流水id' })
  @IsNotEmpty()
  @IsArray()
  ids: string[];

  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  user: string;
}

export class UploadDto {
  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  user: string;
}

export class ExportDto {
  @ApiProperty({ description: '用户' })
  @IsNotEmpty()
  @IsString()
  user: string;

  @ApiProperty({ description: '信息ID' })
  @IsNotEmpty()
  @IsArray()
  ids: string[];
}

export class WxlistDto {
  @ApiProperty({ description: '账单' })
  @IsNotEmpty()
  @IsString()
  group: string;

  @ApiProperty({ description: '页码' })
  @IsNotEmpty()
  @IsNumber()
  page: number;

  @ApiProperty({ description: '长度' })
  @IsNotEmpty()
  @IsNumber()
  size: number;

  @ApiProperty({ description: '时间' })
  @IsNotEmpty()
  @IsNumber()
  time: number;
}

export class BillsDto {
  @ApiProperty({ description: '组织' })
  @IsNotEmpty()
  @IsString()
  group: string;

  @ApiProperty({ description: '时间' })
  @IsNotEmpty()
  @IsString()
  time: number;
}
