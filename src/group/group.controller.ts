import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  CreateGroupDto,
  DeleteGroupDto,
  FindGroupDto,
  JoinGroupDto,
  SearchGroupDto,
  SwitchGroupDto,
} from './dto/create-group.dto';
import { GroupService } from './group.service';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  create(@Body() createGroupDto: CreateGroupDto) {
    return createGroupDto;
  }

  @Get('list')
  async findAll(@Query() query: FindGroupDto) {
    return await this.groupService.findAll(query);
  }

  @Post('create')
  findOne(@Body() body: CreateGroupDto) {
    return this.groupService.create(body);
  }

  @Get('search')
  async search(@Query() query: SearchGroupDto) {
    return this.groupService.search(query);
  }

  @Get('delete')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(@Query() query: DeleteGroupDto) {
    return await this.groupService.remove(query);
  }

  @Post('join')
  async join(@Body() body: JoinGroupDto) {
    return await this.groupService.join(body);
  }

  @Post('switch')
  async switch(@Body() body: SwitchGroupDto) {
    return await this.groupService.switch(body);
  }
}
