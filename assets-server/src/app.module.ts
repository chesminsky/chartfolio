import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { AppController } from './app.controller';
import { AssetsModule } from './assets/assets.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CryptoController } from './crypto/crypto.controller';
import { CryptoService } from './crypto/crypto.service';
import { CurrencyController } from './currency/currency.controller';
import { CurrencyService } from './currency/currency.service';
import { GPTController } from './gpt/gpt.controller';
import { GPTService } from './gpt/gpt.service';
import { MoexController } from './moex/moex.controller';
import { MoexService } from './moex/moex.service';
import { StocksController } from './stocks/stocks.controller';
import { StocksService } from './stocks/stocks.service';
import { UsersModule } from './users/users.module';
import { TinkoffService } from './tinkoff/tinkoff.service';
import { TinkoffController } from './tinkoff/tinkoff.controller';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: 'logs',
          filename: 'app-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info'
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    }),
    HttpModule,
    CacheModule.register({ isGlobal: true }),
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UsersModule,
    AssetsModule,
    CategoriesModule
  ],
  controllers: [
    AppController,
    CurrencyController,
    CryptoController,
    StocksController,
    MoexController,
    GPTController,
    TinkoffController
  ],
  providers: [CurrencyService, CryptoService, StocksService, MoexService, GPTService, TinkoffService]
})
export class AppModule {}
