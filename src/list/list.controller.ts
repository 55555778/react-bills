import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import * as path from 'path';
import {
  BillsDto,
  ChartDto,
  CreateListDto,
  DeleteDto,
  ExportDto,
  FindListDto,
  WxlistDto,
} from './dto/create-list.dto';

import { ListService } from './list.service';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Post('create')
  @ApiOperation({ summary: '创建流水' })
  async create(@Body() body: CreateListDto) {
    return await this.listService.create(body);
  }

  @Post('edit')
  @ApiOperation({ summary: '编辑流水' })
  async edit(@Body() body: CreateListDto) {
    return await this.listService.edit(body);
  }

  @Post('list')
  @ApiOperation({ summary: '获取流水列表' })
  async findAll(@Body() body: FindListDto) {
    return await this.listService.findAll(body);
  }

  @Post('chart')
  @ApiOperation({ summary: '获取流水图表' })
  async chart(@Body() body: ChartDto) {
    return await this.listService.chart(body);
  }

  @Post('delete')
  @ApiOperation({ summary: '删除流水' })
  async delete(@Body() body: DeleteDto) {
    return await this.listService.delete(body);
  }

  @Post('upload')
  @ApiOperation({ summary: '上传账单 Excel + user 参数' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        user: { type: 'string', example: '123456' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          console.log('👊 ~ ListController ~ uploadExcel ~ file:', file);
          const ext = path.extname(file.originalname);
          const filename = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('user') user: string,
  ) {
    return await this.listService.upload(file.path, user);
  }

  @Post('export')
  @ApiOperation({ summary: '导出账单' })
  async exportExcel(@Body() body: ExportDto, @Res() res: Response) {
    const buffer = await this.listService.exportExcel(body);

    // 设置响应头，告知是文件下载
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent('账单导出.xlsx')}`,
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    // 返回文件流
    res.send(buffer);
  }

  @Post('wxList')
  @ApiOperation({ summary: '微信列表' })
  async wxList(@Body() body: WxlistDto) {
    return await this.listService.wxList(body);
  }

  @Get('wxBills')
  @ApiOperation({ summary: '小程序账单' })
  async wxBills(@Query() query: BillsDto): Promise<any> {
    return await this.listService.wxBills(query);
  }
}
