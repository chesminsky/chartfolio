import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards
} from '@nestjs/common';
import { UserRequest } from 'src/auth/auth.models';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { apiUrl } from 'src/config';
import { AssetsService } from './assets.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { Asset } from './schemas/asset.schema';

@Controller(`${apiUrl}/assets`)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createAssetDto: CreateAssetDto,
    @Req() req: UserRequest
  ): Promise<Asset> {
    return this.assetsService.create(createAssetDto, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: UserRequest): Promise<Asset[]> {
    return this.assetsService.findAll(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string): Promise<Asset> {
    return this.assetsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() asset: Asset): Promise<Asset> {
    return this.assetsService.update(id, asset);
  }

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async delete(@Body() ids: string[]): Promise<string[]> {
    return this.assetsService.delete(ids);
  }
}
