import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Errors } from 'src/errors-enum';
import { DataLimits, UserPlan } from 'src/shared/models';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { defaultCategories } from 'src/users/data/categories';

@Injectable()
export class CategoriesService {
  private get limits(): DataLimits {
    return {
      [UserPlan.Free]: Number(this.configService.get('CATEGORIES_LIMIT_FREE')),
      [UserPlan.Pro]: Number(this.configService.get('CATEGORIES_LIMIT_PRO'))
    };
  }

  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private configService: ConfigService
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const user = await this.userModel.findById(userId).lean();
    const all = await this.findAll(userId);

    if (all.length >= this.limits[user.plan]) {
      throw new BadRequestException({
        message: Errors.CATEGORIES_LIMIT,
        limit: this.limits[user.plan]
      });
    }

    return this.categoryModel.create({ ...createCategoryDto, userId });
  }

  async findAll(userId: string): Promise<Category[]> {
    const userCategories = await this.categoryModel.find({ userId }).lean().exec();
    return [
      ...defaultCategories.map((category) => ({ ...category, userId })),
      ...userCategories,
    ];
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryModel.findOne({ _id: id }).exec();
  }

  async update(id: string, category: Category): Promise<Category> {
    return this.categoryModel.findByIdAndUpdate(id, category, { new: true }).exec();
  }

  async delete(id: string): Promise<Category> {
    const deletedCategory = await this.categoryModel.findByIdAndRemove({ _id: id }).exec();
    return deletedCategory;
  }
}
