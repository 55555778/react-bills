import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBudgetDto {
  @IsNotEmpty({ message: '金额不能为空' })
  @IsNumber()
  money: number;

  @IsNotEmpty({ message: '账本不能为空' })
  @IsString()
  group: string;

  @IsNotEmpty({ message: '用户不能为空' })
  @IsString()
  user: string;

  @IsOptional()
  @IsString()
  remark: string;
}

export class FindBudgetDto {
  @IsNotEmpty()
  @IsString()
  group: string;
}
