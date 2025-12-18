import { Inject, Injectable, LoggerService } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import OpenAI from 'openai';
import { defaultCategories } from 'src/users/data/categories';
import { getJSON } from './helpers';

@Injectable()
export class GPTService {
  openai: OpenAI;

  constructor(
    private configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService
  ) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    const masekedKey = apiKey ? apiKey.slice(0, 5) + '...' : 'undefined';
    this.logger.log('OPENAI_API_KEY', masekedKey);

    const proxyUrl = this.configService.get('PROXY2_URL');
    const proxyAgent = new HttpsProxyAgent(proxyUrl);

    this.openai = new OpenAI({
      apiKey,
      httpAgent: proxyAgent
    });
  }

  async quote(assetName: string, assetCode: string, assetType: string): Promise<Record<string, string | null>> {
    if (assetType === 'stocks' || assetType === 'moex') {
      return this.gptSearch(assetName, assetCode);
    }
    if (assetType === 'currency') {
      return {
        ASSET_TYPE: 'CASH',
        MARKETS: 'FOREX',
        RISK_PROFILE: 'LOW',
        LIQUIDITY: 'LIQUID_ASSETS'
      };
    }
    if (assetType === 'crypto') {
      return {
        ASSET_TYPE: 'CRYPTO',
        RISK_PROFILE: 'AGGRESSIVE',
        LIQUIDITY: 'LIQUID_ASSETS'
      };
    }
    return {};
  }

  private async gptSearch(assetName: string, assetCode: string): Promise<Record<string, string | null>> {
    const categoriesJSON = JSON.stringify(
      defaultCategories.filter((category) =>
        ['ASSET_TYPE', 'MARKETS', 'RISK_PROFILE', 'SECTOR_INDUSTRY', 'INCOME_GENERATION'].includes(category.code)
      )
    );
    const resp = await this.openai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        {
          role: 'user',
          content: `given these categories ${categoriesJSON}, to which categories belongs stock ${assetCode} (${assetName})? result only as JSON. it should have key as category code and value is the code of one of options or null if unknown`
        }
      ],
      model: 'gpt-4.1-nano'
    });

    return getJSON(resp.choices[0].message.content);
  }
}
