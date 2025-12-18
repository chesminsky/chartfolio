import { Body, Controller, Get, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRequest } from 'src/auth/auth.models';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { apiUrl } from 'src/config';
import { Errors } from 'src/errors-enum';
import { CategoryMap, SettingsMap } from './dto/create-user.dto';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';
import { defaultWallet } from './data/assets';
import { defaultCategories } from './data/categories';
import { Asset } from 'src/assets/schemas/asset.schema';
import { Category } from 'src/categories/schemas/category.schema';

@Controller(`${apiUrl}/users`)
export class UsersController {
  constructor(private userService: UsersService, private configService: ConfigService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: UserRequest): Promise<User> {
    const user = await this.userService.findById(req.user?.userId);

    if (!user) {
      throw new UnauthorizedException({
        message: Errors.AUTH_USER_NOT_FOUND
      });
    }

    const plan = user.plan.toUpperCase();
    return {
      ...user,
      categoryMap: JSON.parse(user.categoryMap),
      settingsMap: JSON.parse(user.settingsMap),
      limits: {
        categories: Number(this.configService.get(`CATEGORIES_LIMIT_${plan}`)),
        assets: Number(this.configService.get(`ASSETS_LIMIT_${plan}`))
      }
    };
  }

  @Put('categories')
  @UseGuards(JwtAuthGuard)
  async updateCategoryMap(@Body() categoryMap: CategoryMap, @Req() req: UserRequest): Promise<CategoryMap> {
    return this.userService.updateCategoryMap(req.user.userId, categoryMap);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettingsMap(@Body() settingsMap: SettingsMap, @Req() req: UserRequest): Promise<SettingsMap> {
    return this.userService.updateSettingsMap(req.user.userId, settingsMap);
  }

  @Post('upgrade')
  @UseGuards(JwtAuthGuard)
  async upgrade(@Body() payment: { hash: string; currency: string }, @Req() req: UserRequest): Promise<boolean> {
    return this.userService.upgradePlan(req.user.userId, payment.hash, payment.currency);
  }

  @Get('defaults/assets')
  async getDefaultAssets(): Promise<Partial<Asset>[]> {
    return Promise.resolve([defaultWallet]);
  }

  @Get('defaults/categories')
  async getDefaultCategories(): Promise<Partial<Category>[]> {
    return Promise.resolve(defaultCategories);
  }
}
