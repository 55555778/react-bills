import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { Response } from 'src/common/interface/response';
import { Setting } from 'src/setting/schema/setting.schema';
import * as xlsx from 'xlsx';

import * as dayjs from 'dayjs';
import {
  BillsDto,
  ChartDto,
  CreateListDto,
  DeleteDto,
  ExportDto,
  FindListDto,
  WxlistDto,
} from './dto/create-list.dto';
import { List } from './schema/list.schema';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(List.name) private ListModel: Model<List>,
    @InjectModel(Setting.name) private SettingModel: Model<Setting>,
  ) {}

  async create(body: CreateListDto): Promise<Response> {
    const list = await this.ListModel.create({
      ...body,
    });
    return {
      status: 0,
      result: list,
      msg: '创建成功',
    };
  }

  async edit(body: CreateListDto) {
    const list = await this.ListModel.findByIdAndUpdate(body._id, body);
    return {
      status: 0,
      result: list,
      msg: '编辑成功',
    };
  }

  async findAll({
    user,
    size = 0,
    type,
    money,
    time,
    account,
    category,
  }: FindListDto): Promise<Response> {
    let list: any = await this.ListModel.find({ group: user, isdelete: false }) // 如果你有 user 字段可加上
      .populate('category', 'name _id') // 只填充 name 和 _id 字段，减少数据体积
      .populate('account', 'name _id')
      .populate('shop', 'name _id')
      .populate('project', 'name _id')
      .populate('user', 'name _id')
      .lean();
    // console.log('👊 ~ ListService ~ findAll ~ list:', list);

    if (list.length === 0) {
      return {
        status: 0,
        result: { list, income: 0, outcome: 0, total: 0 },
        msg: '获取成功',
      };
    }

    if (money && money[0] !== null) {
      list = list.filter((item) => {
        return item.money >= money[0] && item.money <= money[1];
      });
    }
    if (type && type !== 'all') {
      list = list.filter((item) => {
        return item.type === type;
      });
      // console.log('👊 ~ ListService ~ list.filter ~ list:', list);
    }

    if (category) {
      list = list.filter((item) => {
        return item.category._id === category;
      });
    }

    if (account) {
      list = list.filter((item) => {
        return item.account._id === account;
      });
    }

    if (time) {
      list = list.filter((item) => {
        return item.time >= time[0] && item.time <= time[1];
      });
    }
    if (list.length === 0) {
      console.log('👊 ~ ListService ~ findAll ~ list:', list);

      return {
        status: 0,
        result: { list, income: 0, outcome: 0, total: 0 },
        msg: '获取成功',
      };
    }
    const income = list
      .map((item) => (item.type === '收入' ? item.money : 0))
      .reduce((pre, cur) => pre + cur);
    const outcome = list
      .map((item) => (item.type === '支出' ? item.money : 0))
      .reduce((pre, cur) => pre + cur);

    const total = income - outcome;
    if (size != 0) {
      list.splice(size);
    }
    return {
      status: 0,
      result: { list, income, outcome, total },
      msg: '获取成功',
    };
  }

  async chart({ user }: ChartDto): Promise<Response> {
    // 查询 list 并填充 category.name
    const list = await this.ListModel.find({ group: user })
      .populate('category', 'name _id')
      .lean();

    const incomeMap = new Map<string, { name: string; value: number }>();
    // console.log('👊 ~ ListService ~ chart ~ incomeMap:', incomeMap);
    const expenseMap = new Map<string, { name: string; value: number }>();
    // console.log('👊 ~ ListService ~ chart ~ expenseMap:', expenseMap);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of list) {
      const cat = item.category;
      if (!cat || !cat.name) continue;

      const name = cat.name;
      const money = item.money || 0;

      if (item.type === '收入') {
        totalIncome += money;
        if (incomeMap.has(name)) {
          incomeMap.get(name)!.value += money;
        } else {
          incomeMap.set(name, { name, value: money });
        }
      } else if (item.type === '支出') {
        totalExpense += money;
        if (expenseMap.has(name)) {
          expenseMap.get(name)!.value += money;
        } else {
          expenseMap.set(name, { name, value: money });
        }
      }
    }

    //获取当前月的日期
    const start = dayjs().startOf('month');
    const end = dayjs().endOf('month');
    const spendList: number[] = [];
    const incomeList: number[] = [];
    const dates: string[] = [];

    for (
      let d = start;
      d.isBefore(end) || d.isSame(end, 'day');
      d = d.add(1, 'day')
    ) {
      const dayStart = d.startOf('day').valueOf();
      const dayEnd = d.endOf('day').valueOf();

      dates.push(d.format('MM.DD'));

      const dayItems = list.filter(
        (item: any) =>
          dayjs(item.createdAt).valueOf() >= dayStart &&
          dayjs(item.createdAt).valueOf() <= dayEnd,
      );

      const spend = dayItems
        .filter((item) => item.type === '支出')
        .reduce((sum, cur) => sum + Number(cur.money), 0);

      const income = dayItems
        .filter((item) => item.type === '收入')
        .reduce((sum, cur) => sum + Number(cur.money), 0);

      spendList.push(spend); // 没有支出 → 0
      incomeList.push(income); // 没有收入 → 0
    }

    return {
      msg: '获取成功',
      status: 0,
      result: {
        income: Array.from(incomeMap.values()),
        expense: Array.from(expenseMap.values()),
        totalIncome,
        totalExpense,
        line: { dates, spendList, incomeList },
      },
    };
  }

  async delete({ ids, user }: DeleteDto): Promise<Response> {
    await this.ListModel.updateMany(
      { _id: { $in: ids }, user },
      { $set: { isdelete: true } },
    );

    return {
      msg: '删除成功',
      status: 0,
    };
  }

  excelDateTotime = (serial: number): number => {
    const excelStartDate = dayjs('1900-01-01').add(serial - 2, 'day');
    return excelStartDate.valueOf();
  };

  async prepareCategoryItems(userId: string) {
    const types = ['账户', '商家', '支出', '收入'];
    const typeMainMap = new Map();

    const category = (
      await Promise.all(
        types.map((type) =>
          this.SettingModel.find({ type, user: userId, isdelete: false }),
        ),
      )
    ).flatMap((list, i) => {
      typeMainMap.set(types[i], list);
      return list;
    });

    const childNames = [
      ...new Set(category.flatMap((item: any) => item.children || [])),
    ];

    const childList = await this.SettingModel.find({
      name: { $in: childNames },
      user: userId,
      isdelete: false,
    });

    const shopList = category.filter((item) => item.type === '商家');

    return shopList.concat(childList);
  }

  formatExcelData(raw: any[], userId: string, categoryItems: any) {
    return raw.map((item) => {
      return {
        money: Number(item['金额']),
        time: this.excelDateTotime(item['时间']),
        remark: String(item['备注'] || ''),
        type: item['流水类型'],
        category:
          categoryItems.find((i) => item['分类'] === i.name)?._id || null,
        account:
          categoryItems.find((i) => item['账户'] === i.name)?._id || null,
        shop: categoryItems.find((i) => item['商家'] === i.name)?._id || null,
        user: userId,
        isdelete: false,
      };
    });
  }

  parseExcelFile(filePath: string) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(sheet);
  }

  deleteFile(filePath: string) {
    try {
      fs.unlinkSync(filePath); // or await fs.promises.unlink(filePath);
      console.log(`文件已删除: ${filePath}`);
    } catch (error) {
      console.error(`删除文件失败: ${filePath}`, error);
    }
  }

  async upload(filePath: string, userId: string): Promise<Response> {
    try {
      const rawRows = this.parseExcelFile(filePath);
      console.log('读取到 Excel 行数:', rawRows.length);

      const categoryItems = await this.prepareCategoryItems(userId);
      const formatted = this.formatExcelData(rawRows, userId, categoryItems);

      await this.ListModel.insertMany(formatted);

      return {
        msg: '上传成功',
        status: 0,
      };
    } catch (error) {
      console.error('上传处理失败:', error);
      return {
        msg: '上传失败',
        status: 1,
        result: null,
      };
    } finally {
      this.deleteFile(filePath);
    }
  }

  async exportExcel({ user, ids }: ExportDto) {
    const list: any = await this.ListModel.find({
      group: user,
      isdelete: false,
      _id: { $in: ids },
    }) // 如果你有 user 字段可加上
      .populate('category', 'name _id') // 只填充 name 和 _id 字段，减少数据体积
      .populate('account', 'name _id')
      .populate('shop', 'name _id')
      .populate('project', 'name _id')
      .populate('user', 'name _id')
      .lean();
    console.log('👊 ~ ListService ~ exportExcel ~ list:', list);

    const sheetData = list.map((item) => ({
      流水类型: item.type,
      分类: item.category?.name || '',
      金额: item.money,
      时间: dayjs(item.time).format('YYYY-MM-DD'),
      账户: item.account?.name || '',
      商家: item.shop?.name || '',
      项目: item.project?.name || '',
      备注: item.remark || '',
      创建人: item.user?.name || '',
    }));
    const worksheet = xlsx.utils.json_to_sheet(sheetData);

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, '账单');
    const buffer = xlsx.write(workbook, { type: 'buffer' });
    return buffer;
  }

  async wxList({ page, group, size, time }: WxlistDto): Promise<Response> {
    // 1. 获取月份范围
    const monthStart = dayjs(time).startOf('month').valueOf();
    const monthEnd = dayjs(time).endOf('month').valueOf();
    // 查询数据（按时间倒序）
    const list = await this.ListModel.find({
      group,
      isdelete: false,
      time: { $gte: monthStart, $lte: monthEnd },
    })
      .skip((page - 1) * size)
      .limit(size)
      .sort({ time: -1 }) // 按时间倒序
      .lean()
      .populate('category', 'name _id parent')
      .populate('account', 'name _id')
      .populate('shop', 'name _id')
      .populate('project', 'name _id')
      .populate('user', 'name _id');

    let monthExpenseTotal = 0;
    let monthIncomeTotal = 0;
    // 整理数据（插入日期头）
    const result = [];
    let lastDate: string | null = null;

    list.forEach((item) => {
      if (item.type === '支出') {
        monthExpenseTotal += Number(item.money || 0);
      } else if (item.type === '收入') {
        monthIncomeTotal += Number(item.money || 0);
      }
      const dateKey = dayjs(item.time).format('YYYY-MM-DD'); // 用于分组判断

      // 如果是新的一天，插入日期头
      if (dateKey !== lastDate) {
        // 计算当天总支出、总收入
        const dayItems = list.filter(
          (d) => dayjs(d.time).format('YYYY-MM-DD') === dateKey,
        );
        const expenseTotal = dayItems
          .filter((d) => d.type === '支出')
          .reduce((sum, d) => sum + Number(d.money || 0), 0);
        const incomeTotal = dayItems
          .filter((d) => d.type === '收入')
          .reduce((sum, d) => sum + Number(d.money || 0), 0);

        result.push({
          type: 'date',
          dateStr: dayjs(item.time).format('MM月DD日 dddd'), // 08月09日 星期六
          expenseTotal,
          incomeTotal,
        });
        lastDate = dateKey;
      }

      // 插入当天的数据
      result.push({
        type: 'data',
        ...item,
      });
    });

    return {
      status: 0,
      msg: 'success',
      result: {
        list: result,
        monthExpenseTotal,
        monthIncomeTotal,
      },
    };
  }
  emptyMonths() {
    return Array.from({ length: 12 }, (_, i) => ({
      month: String(i + 1).padStart(2, '0'),
      income: 0,
      expense: 0,
      balance: 0,
    }));
  }

  async wxBills({ time, group }: BillsDto): Promise<Response> {
    // 1. 从时间戳获取年份

    const startOfYear = dayjs(Number(time)).startOf('year').valueOf(); // ✅ 直接用
    const endOfYear = dayjs(Number(time)).endOf('year').valueOf();
    console.log(
      '👊 ~ ListService ~ wxBills ~ endDate:',
      startOfYear,
      endOfYear,
    );

    // 3. 聚合统计
    const list = await this.ListModel.find({
      group,
      isdelete: false,
      time: { $gte: startOfYear, $lte: endOfYear },
    });

    // 初始化
    const months = this.emptyMonths();
    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of list) {
      const t = item.time;
      const mIndex = dayjs(t).month(); // 0-11
      const amt = item.money || 0;

      if (item.type === '收入') {
        months[mIndex].income += amt;
        totalIncome += amt;
      } else {
        months[mIndex].expense += amt;
        totalExpense += amt;
      }
    }

    months.forEach((m) => {
      m.balance = m.income - m.expense;
    });

    const totalBalance = totalIncome - totalExpense;

    return {
      status: 0,
      msg: 'success',
      result: {
        months: months.reverse(), // 月度数据
        total: {
          income: totalIncome,
          expense: totalExpense,
          balance: totalBalance,
        },
      },
    };
  }
}
