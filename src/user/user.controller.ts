import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
  UserDetailDto,
} from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('用户')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  @ApiOperation({ summary: '新建用户' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登录' })
  async login(@Body() login: LoginDto) {
    return await this.userService.login(login);
  }

  @Get('list')
  @ApiOperation({ summary: '获取列表' })
  @UseGuards(AuthGuard('jwt')) // 👈 保护此接口，必须带上有效 token 才能访问
  async list() {
    return await this.userService.getList();
  }

  @Post('update')
  @ApiOperation({ summary: '更新用户' })
  @UseGuards(AuthGuard('jwt')) // 👈 保护此接口，必须带上有效 token 才能访问
  async update(@Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(updateUserDto);
  }

  @Get('detail')
  @ApiOperation({ summary: '用户详情' })
  @UseGuards(AuthGuard('jwt'))
  async detail(@Query() query: UserDetailDto) {
    return await this.userService.detail(query);
  }
}
