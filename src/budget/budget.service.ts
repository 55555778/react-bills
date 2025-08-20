import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dayjs from 'dayjs';
import { Model } from 'mongoose';
import { Response } from 'src/common/interface/response';
import { List } from 'src/list/schema/list.schema';
import { CreateBudgetDto, FindBudgetDto } from './dto/create-budget.dto';
import { Budget } from './entities/budget.entity';
@Injectable()
export class BudgetService {
  constructor(
    @InjectModel(Budget.name) private budgetModel: Model<Budget>,
    @InjectModel(List.name) private listModel: Model<List>,
  ) {}
  async create({
    money,
    group,
    user,
    remark,
  }: CreateBudgetDto): Promise<Response> {
    await this.budgetModel.create({
      money,
      group,
      user,
      time: Date.now(),
      remark,
    });

    return {
      status: 0,
      msg: '创建成功',
    };
  }

  async findAll({ group }: FindBudgetDto): Promise<Response> {
    const budget = await this.budgetModel.findOne({ group, isdelete: false });
    // 获取当前月的所有支出
    const list = await this.listModel.find({
      group,
      type: '支出',
      time: {
        $gte: dayjs().startOf('month').toDate(),
        $lte: dayjs().endOf('month').toDate(),
      },
      isdelete: false,
    });
    console.log('👊 ~ BudgetService ~ findAll ~ list:', list);
    const sum = list.reduce((pre, cur) => pre + cur.money, 0);

    return {
      status: 0,
      msg: '查询成功',
      result: { budget, sum },
    };
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} budget`;
  // }

  // update(id: number, updateBudgetDto: UpdateBudgetDto) {
  //   return `This action updates a #${id} budget`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} budget`;
  // }
}
