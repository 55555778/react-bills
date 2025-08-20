import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Response } from 'src/common/interface/response';
import { SettingService } from 'src/setting/setting.service';
import {
  CreateGroupDto,
  DeleteGroupDto,
  FindGroupDto,
  JoinGroupDto,
  SearchGroupDto,
  SwitchGroupDto,
} from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './schema/group.schema';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(Group.name) private GroupModel: Model<Group>,
    private settingService: SettingService,
  ) {}

  // 每个用户都初始化一个账单
  async default(userId: string): Promise<Response> {
    // // console.log('👊 ~ GroupService ~ default ~ userId:', userId);
    const res = await this.GroupModel.create({
      name: '默认账本',
      default: true,
      owner: userId,
      users: [userId],
      main: true,
    });
    return { status: 0, msg: '创建成功', result: res };
  }

  // 查询账本数据
  async findGroup(userId: string): Promise<Response> {
    const res = await this.GroupModel.find({
      users: { $in: [userId] },
    });
    return { status: 0, msg: '查询成功', result: res };
  }

  async findAll({ user }: FindGroupDto): Promise<Response> {
    // console.log('👊 ~ GroupService ~ findAll ~ user:', user);
    const list = await this.GroupModel.find({
      $or: [
        { users: new mongoose.Types.ObjectId(user) },
        { owner: new mongoose.Types.ObjectId(user) },
      ],
      isdelete: false,
    })
      .populate('owner')
      .populate('users');

    return { status: 0, msg: '查询成功', result: list };
  }

  async create({ name, user }: CreateGroupDto) {
    const res = await this.GroupModel.create({
      name,
      owner: user,
      users: [user],
    });

    await this.settingService.initDataFromJson(res._id.toString());
    return { status: 0, msg: '创建成功', result: res };
  }

  findOne(id: number) {
    return `This action returns a #${id} group`;
  }

  update(id: number, updateGroupDto: UpdateGroupDto) {
    return `This action updates a #${id} group,${updateGroupDto}`;
  }

  async remove({ _id }: DeleteGroupDto): Promise<Response> {
    const res = await this.GroupModel.findByIdAndUpdate(_id, {
      isdelete: true,
    });
    return { status: 0, msg: '删除成功', result: res };
  }

  async search({ name }: SearchGroupDto): Promise<Response> {
    const res = await this.GroupModel.find({
      name,
    })
      .populate('users')
      .populate('owner');
    return { status: 0, msg: '查询成功', result: res };
  }

  async join({ group, user }: JoinGroupDto): Promise<Response> {
    const groupDoc = await this.GroupModel.findById(group);
    if (!groupDoc) {
      return { status: 1, msg: '账本不存在' };
    }
    const userObjectId = new mongoose.Types.ObjectId(user);

    if (groupDoc.users.includes(userObjectId)) {
      return { status: 1, msg: '已加入,请勿重复添加' };
    }

    const result = await this.GroupModel.findByIdAndUpdate(
      group,
      {
        $addToSet: { users: user },
      },
      { new: true },
    );
    return { status: 0, msg: '加入成功', result };
  }

  async switch({ _id, user }: SwitchGroupDto): Promise<Response> {
    const groupList = await this.GroupModel.find({
      $or: [
        { users: new mongoose.Types.ObjectId(user) },
        { owner: new mongoose.Types.ObjectId(user) },
      ],
      isdelete: false,
    });
    const group = groupList.find((item) => item._id.toString() === _id);
    if (!group) {
      return { status: 1, msg: '账本不存在' };
    }
    await this.GroupModel.updateMany(
      {
        $or: [
          { users: new mongoose.Types.ObjectId(user) },
          { owner: new mongoose.Types.ObjectId(user) },
        ],
      },
      {
        $set: {
          main: false,
        },
      },
    );
    await this.GroupModel.findByIdAndUpdate(_id, {
      main: true,
    });
    return { status: 0, msg: '切换成功' };
  }
}
