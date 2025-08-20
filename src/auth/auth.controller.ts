import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RefreshAuthDto } from './dto/create-auth.dto';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @ApiOperation({ summary: '刷新token' })
  async refresh(@Body() dto: RefreshAuthDto) {
    return await this.authService.refresh(dto);
  }

  @Get('wx-login')
  @ApiOperation({ summary: '微信登录' })
  async login(@Query() query: { code: string; email: string }) {
    return await this.authService.login(query);
  }

  @Get('user-detail')
  @ApiOperation({ summary: '获取用户详情' })
  async getUserDetail(@Query() query: { user: string; group: string }) {
    return await this.authService.getUserDetail(query);
  }
}
