import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { Response } from 'src/common/interface/response';
import { GroupService } from 'src/group/group.service';
import { Setting } from 'src/setting/schema/setting.schema';
import { SettingService } from 'src/setting/setting.service';
import {
  CreateUserDto,
  LoginDto,
  UpdateUserDto,
  UserDetailDto,
} from './dto/create-user.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModule: Model<UserDocument>,
    @InjectModel(Setting.name) private settingModel: Model<Setting>,
    private settingService: SettingService,
    private groupService: GroupService,
    private authService: AuthService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<Response> {
    // 1. 创建用户前先检查
    const existName = await this.UserModule.findOne({
      name: createUserDto.name,
    });
    if (existName) return { status: 1, msg: '名字已存在' };

    const existEmail = await this.UserModule.findOne({
      email: createUserDto.email,
    });
    if (existEmail) return { status: 1, msg: '邮箱已存在' };

    // 2. 创建新用户
    const createdUser = new this.UserModule(createUserDto);
    await createdUser.save();
    console.log('👊 ~ UserService ~ create ~ createdUser:', createdUser);

    const group = await this.groupService.default(createdUser._id.toString());
    console.log('👊 ~ UserService ~ create ~ group:', group);

    const setting = await this.settingService.initDataFromJson(
      group.result._id.toString(),
    );

    return { status: 0, msg: '创建成功', result: { createdUser, setting } };
  }

  async login({ email, password, remember }: LoginDto): Promise<Response> {
    console.log('👊 ~ UserService ~ login ~ name, password:', email, password);
    const user = await this.UserModule.findOne({ email });
    if (!user || user.password !== password) {
      return { status: 1, msg: '邮箱或密码错误' };
    }
    console.log('👊 ~ UserService ~ login ~ user:', user);
    // 调取tokenAPI
    const payload = {
      sub: user._id,
      name: user.name,
      permissions: user.permissions,
    };
    const token = this.authService.generateToken(payload);
    const group = await this.groupService.findGroup(user._id.toString());

    if (remember) {
      return {
        status: 0,
        msg: '登录成功',
        result: { user, ...token, group: group.result },
      };
    } else {
      return {
        status: 0,
        msg: '登录成功',
        result: { user, accessToken: token.accessToken, group: group.result },
      };
    }
  }

  async getList() {
    const list = await this.UserModule.find();
    return { status: 0, msg: '查询成功', result: list };
  }

  async update({
    _id,
    name,
    email,
    isDark = true,
    language = 'zh-CN',
  }: UpdateUserDto): Promise<Response> {
    const user = await this.UserModule.findById(_id);
    if (!user) {
      return { status: 1, msg: '用户不存在' };
    }

    const existEmail = await this.UserModule.findOne({
      email,
      _id: { $ne: _id },
    });
    if (existEmail) {
      return { status: 1, msg: '邮箱已存在' };
    }

    await this.UserModule.updateOne(
      { _id },
      {
        name,
        email,
        isDark,
        language,
      },
    );
    return { status: 0, msg: '更新成功' };
  }

  async detail({ _id }: UserDetailDto) {
    const user = await this.UserModule.findById(_id);
    if (!user) {
      return { status: 1, msg: '用户不存在' };
    }
    return { status: 0, msg: '查询成功', result: user };
  }
}
