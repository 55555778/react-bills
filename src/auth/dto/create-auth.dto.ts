import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshAuthDto {
  @ApiProperty({ description: 'accessToken' })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
