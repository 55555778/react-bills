import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import * as dayjs from 'dayjs';
import mongoose, { Model } from 'mongoose';
import { Response } from 'src/common/interface/response';
import { GroupService } from 'src/group/group.service';
import { Group } from 'src/group/schema/group.schema';
import { List } from 'src/list/schema/list.schema';
import { Setting } from 'src/setting/schema/setting.schema';
import { SettingService } from 'src/setting/setting.service';
import { User } from 'src/user/schema/user.schema';
import { RefreshAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Setting.name) private readonly SettingModel: Model<Setting>,
    @InjectModel(List.name) private readonly ListModel: Model<List>,
    @InjectModel(Group.name) private readonly GroupModel: Model<Group>,

    private groupService: GroupService,
    private settingService: SettingService,
  ) {}

  generateToken(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30m', // accessToken 有效期
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d', // refreshToken 有效期
    });

    return { accessToken, refreshToken };
  }

  async refresh({ refreshToken }: RefreshAuthDto): Promise<Response> {
    console.log('👊 ~ AuthService ~ refresh ~ token:', refreshToken);

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      const newAccessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          name: payload.name,
          permissions: payload.permissions,
        },
        { expiresIn: '10s' },
      );

      return { status: 0, msg: '刷新成功', result: newAccessToken };
    } catch (err) {
      return {
        status: 401,
        msg: '无效或过期的 refreshToken',
      };
    }
  }

  private async getWechatSession(code: string) {
    const configService = new ConfigService();
    const { data } = await axios.get(
      `https://api.weixin.qq.com/sns/jscode2session`,
      {
        params: {
          appid: configService.get<string>('APPID'),
          secret: configService.get<string>('APPSECRET'),
          js_code: code,
          grant_type: 'authorization_code',
        },
      },
    );
    if (data.errcode) throw new Error(`微信登录失败: ${data.errmsg}`);
    return data;
  }

  private async findOrCreateUser(openid: string, email: string) {
    let user = await this.UserModel.findOne({ wxOpenid: openid });
    if (user) return { user, msg: '登录成功' };

    user = await this.UserModel.findOne({ email });
    if (user) {
      user.wxOpenid = openid;
      await user.save();
      return { user, msg: '绑定成功' };
    }

    user = new this.UserModel({
      email: email.trim(),
      name: `微信用户${dayjs().valueOf()}`,
      wxOpenid: openid,
    });
    await user.save();

    const newGroup = await this.groupService.default(user._id.toString());
    await this.settingService.initDataFromJson(newGroup.result[0]._id);

    return { user, msg: '创建成功' };
  }

  async login({ code, email }): Promise<Response> {
    const { openid } = await this.getWechatSession(code);
    const { user, msg } = await this.findOrCreateUser(openid, email);

    return this.buildResponse(user, msg);
  }

  private async buildResponse(user: any, msg: string) {
    const group = (await this.groupService.findGroup(user._id.toString()))
      .result;
    const account = await this.SettingModel.findOne({
      group: group[0]._id,
      name: '银行卡',
    });

    return {
      status: 0,
      msg,
      result: {
        user,
        group,
        account,
        token: this.generateToken({
          sub: user._id,
          name: user.name,
          permission: user.permissions,
        }).accessToken,
      },
    };
  }

  async getUserDetail({ user, group }): Promise<Response> {
    const userInfo = await this.UserModel.findById(user);
    //获取数据长度
    const groupList = await this.GroupModel.find({
      $or: [
        { users: new mongoose.Types.ObjectId(user) },
        { owner: new mongoose.Types.ObjectId(user) },
      ],
      isdelete: false,
    })
      .populate('owner')
      .populate('users');
    const list = await this.ListModel.countDocuments({
      user,
      group,
      isdelete: false,
    });

    return {
      status: 0,
      msg: '获取成功',
      result: {
        userInfo,
        groupList,
        list,
      },
    };
  }
}
