import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import { Model, Types } from 'mongoose';
import * as path from 'path';
import { Response } from 'src/common/interface/response';

import {
  CreateOptionsDto,
  CreateSettingDto,
  FindDto,
  GetCategoryListDto,
  SwitchSettingDto,
} from './dto/create-setting.dto';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingService {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
  ) {}

  async initDataFromJson(userId: string): Promise<Response> {
    // // console.log('👊 ~ SettingService ~ initDataFromJson ~ userId:', userId);
    // 拼接绝对路径，__dirname 是当前文件夹路径
    const filePath = path.join(__dirname, '../../data/setting.json');

    // 读取 JSON 文件（同步或异步均可）
    const jsonData = fs.readFileSync(filePath, 'utf-8');

    // 解析 JSON 字符串为对象数组
    const settingsArray = JSON.parse(jsonData);

    const userSettings = settingsArray.map((item: any) => {
      delete item._id; // 删除旧的 _id（如果 JSON 中含有 _id 字段）
      return {
        ...item,
        group: new Types.ObjectId(userId),
      };
    });

    // 插入数据库（注意去重或先清空）
    const deleteResult = await this.settingModel.deleteMany({ group: userId }); // 清空原有数据，谨慎使用
    const insertResult = await this.settingModel.insertMany(userSettings);

    // const insertedData = await this.settingModel.find({ user: userId });

    // // console.log(
    // // '👊 ~ SettingService ~ initDataFromJson ~ insertedData:',
    // // insertedData,
    // // );
    return {
      status: 0,
      msg: '初始化成功',
      result: { insertResult, userSettings, deleteResult },
    };
  }

  async getSettingList({ type, _id }: FindDto): Promise<Response> {
    const mainAccounts: any = await this.settingModel.find({
      type,
      group: _id,
    });

    // 2. 提取所有子账户名称（去重）
    const childNames = [
      ...new Set(mainAccounts.flatMap((acc) => acc.children || [])),
    ];

    // 3. 批量查询子账户数据
    const childAccounts = await this.settingModel.find({
      name: { $in: childNames },
      group: _id,
    });

    // 4. 创建子账户映射表
    const childMap = new Map(
      childAccounts.map((child: any) => [child.name, child]),
    );

    // 5. 构建最终结果
    const result = mainAccounts.map((account) => {
      // console.log('👊 ~ SettingService ~ getSettingList ~ account:', account);
      return {
        ...account.toObject(),
        children: (account.children || []).map((name) => {
          // console.log('👊 ~ SettingService ~ getSettingList ~ name:', name);
          return (
            childMap.get(name) || {
              name,
              money: 0,
              isdelete: false,
              parent: account.name,
              _id: childMap.get(name)?._id,
            }
          );
        }),
      };
    });

    return {
      status: 0,
      msg: '获取成功',
      result,
    };
  }

  async createSetting({ level, type, category, user, _id }: CreateSettingDto) {
    if (level) {
      const exit = await this.settingModel.findOne({
        type,
        category,
      });
      if (exit) {
        return {
          status: 1,
          msg: '类别已存在',
        };
      }

      const setting = await this.settingModel.create({
        type,
        category,
        name: category,
        group: user,
      });
      return {
        status: 0,
        msg: '创建成功',
        result: setting,
      };
    } else {
      const exit = await this.settingModel.findOne({
        type,
        group: user,
        _id,
        children: {
          $elemMatch: { name: category }, // children 数组中有对象的 name 字段等于 category
        },
      });
      if (exit) {
        return {
          status: 1,
          msg: '名称已存在',
        };
      } else {
        const parent: any = await this.settingModel
          .findOne({
            group: user,
            type,
            _id,
          })
          .exec();
        if (parent) {
          parent.children.push({
            name: category,
            money: 0,
            isdelete: false,
          });
          await parent.save();
        }
        return {
          status: 0,
          msg: '创建成功',
        };
      }
    }
  }

  async getLevelOptions({ _id, type }: CreateOptionsDto): Promise<Response> {
    const list = await this.settingModel.find({
      group: _id,
      type,
    });
    // console.log('👊 ~ SettingService ~ getLevelOptions ~ list:', list);
    const options = list.map((item: any) => {
      if (item.children) {
        return {
          label: item.name,
          value: item._id,
        };
      }
    });

    return {
      status: 0,
      msg: '获取成功',
      result: options,
    };
  }

  async switchSetting({ _id, group }: SwitchSettingDto): Promise<Response> {
    const setting: any = await this.settingModel.findOne({
      _id,
      group,
    });
    console.log('👊 ~ SettingService ~ switchSetting ~ setting:', setting);
    // // console.log('👊 ~ SettingService ~ setting:', setting);
    if (setting) {
      // 切换子项的 isdelete 字段
      setting.isdelete = !setting.isdelete;
      await setting.save();
      return {
        status: 0,
        msg: '切换成功',
      };
    } else {
      return {
        status: 1,
        msg: '未找到对应的设置',
      };
    }
  }

  async getCategoryList({ type, user }: GetCategoryListDto): Promise<Response> {
    let types = ['商家', '账户'];
    if (type === 'all') {
      types = types.concat(['支出', '收入']);
    } else {
      types.push(type);
    }
    // // console.log('👊 ~ SettingService ~ getCategoryList ~ types:', types);

    // 查询所有主项（合并）
    const typeToMainMap = new Map<string, any[]>();
    const allMainList = (
      await Promise.all(
        types.map((t) => this.settingModel.find({ type: t, group: user })),
      )
    ).flatMap((list, i) => {
      typeToMainMap.set(types[i], list);
      return list;
    });

    // 提取所有子项名称（去重）
    const childNames = [
      ...new Set(allMainList.flatMap((item: any) => item.children || [])),
    ];

    // 批量查找子项
    const childList = await this.settingModel.find({
      name: { $in: childNames },
      group: user,
      isdelete: false,
    });

    const childMap = new Map(childList.map((c: any) => [c.name, c]));

    // 构造通用格式
    const buildList = (list: any[]) =>
      list.map((item) => ({
        label: item.name,
        value: item._id,
        selectable: item.type === '商家' ? true : false,
        children: (item.children || []).map((name) => {
          const child = childMap.get(name);
          return child
            ? {
                label: child.name,
                value: child._id,
              }
            : {
                label: name,
                value: null,
              };
        }),
      }));

    // 构建结果
    const result: Record<string, any[]> = {};
    types.forEach((t) => {
      result[t] = buildList(typeToMainMap.get(t) || []);
    });

    return {
      status: 0,
      msg: '获取成功',
      result: {
        categorys:
          type === 'all' ? result['收入'].concat(result['支出']) : result[type],
        shops: result['商家'],
        accounts: result['账户'],
      },
    };
  }

  async getWxCategoryList({ type, _id }: FindDto): Promise<Response> {
    const mainAccounts: any = await this.settingModel.find({
      type,
      group: _id,
    });

    const childNames = [
      ...new Set(mainAccounts.flatMap((acc) => acc.children || [])),
    ];

    // 2. 查子账户
    const childAccounts = await this.settingModel.find({
      name: { $in: childNames },
      group: _id,
    });

    // 3. 直接返回子账户列表
    return {
      status: 0,
      msg: '获取成功',
      result: childAccounts.map((child: any) => child.toObject()),
    };
  }
}
