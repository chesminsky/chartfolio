import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Errors } from 'src/errors-enum';
import { DataLimits, UserPlan } from 'src/shared/models';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset, AssetDocument } from './schemas/asset.schema';

@Injectable()
export class AssetsService {
  private get limits(): DataLimits {
    return {
      [UserPlan.Free]: Number(this.configService.get('ASSETS_LIMIT_FREE')),
      [UserPlan.Pro]: Number(this.configService.get('ASSETS_LIMIT_PRO'))
    };
  }

  constructor(
    @InjectModel(Asset.name) private readonly assetModel: Model<AssetDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private configService: ConfigService
  ) {}

  async create(createAssetDto: CreateAssetDto, userId: string): Promise<Asset> {
    const user = await this.userModel.findById(userId).lean();
    const all = await this.findAll(userId);

    if (all.length >= this.limits[user.plan]) {
      throw new BadRequestException({
        message: Errors.ASSETS_LIMIT,
        limit: this.limits[user.plan]
      });
    }

    return this.assetModel.create({
      ...createAssetDto,
      userId
    });
  }

  async findAll(userId: string): Promise<Asset[]> {
    return this.assetModel.find({ userId }).exec();
  }

  async findOne(id: string): Promise<Asset> {
    return this.assetModel.findOne({ _id: id }).exec();
  }

  async update(id: string, asset: Asset): Promise<Asset> {
    return this.assetModel.findByIdAndUpdate(id, asset, { new: true }).exec();
  }

  async delete(ids: string[]): Promise<string[]> {
    await this.assetModel.deleteMany({ _id: ids }).exec();
    return ids;
  }
}
