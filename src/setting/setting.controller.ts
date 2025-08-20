import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateOptionsDto,
  CreateSettingDto,
  FindDto,
  GetCategoryListDto,
  SwitchSettingDto,
} from './dto/create-setting.dto';
import { SettingService } from './setting.service';

@Controller('setting')
@ApiTags('分类设置')
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  // @Post('init')
  // @ApiOperation({ summary: '初始化分类列表' })
  // async initData() {
  //   return this.settingService.initDataFromJson();
  // }

  @Get('list')
  @ApiOperation({ summary: '查询列表' })
  @UseGuards(AuthGuard('jwt'))
  async getSettingList(@Query() query: FindDto) {
    return this.settingService.getSettingList(query);
  }

  @Post('create')
  @ApiOperation({ summary: '创建分类' })
  async createSetting(@Body() body: CreateSettingDto) {
    return this.settingService.createSetting(body);
  }

  @Get('levelOptions')
  @ApiOperation({ summary: '获取分类层级' })
  async getLevelOptions(@Query() query: CreateOptionsDto) {
    return this.settingService.getLevelOptions(query);
  }

  @Post('switch')
  @ApiOperation({ summary: '禁用/启用选项' })
  async switchSetting(@Body() body: SwitchSettingDto) {
    return this.settingService.switchSetting(body);
  }

  @Get('category')
  @ApiOperation({ summary: '获取分类列表' })
  async getCategoryList(@Query() query: GetCategoryListDto) {
    return this.settingService.getCategoryList(query);
  }

  @Get('wx-category')
  @ApiOperation({ summary: '获取微信分类列表' })
  async getWxCategoryList(@Query() query: FindDto) {
    return this.settingService.getWxCategoryList(query);
  }
}
