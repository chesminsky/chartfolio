import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { Express } from 'express';
import { setupLogsUi } from './logs/setup-logs-ui';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // Static file serving was removed; re-add if you have a public directory to expose
  app.enableCors();

  // Logs UI
  const httpServer = app.getHttpAdapter().getInstance() as Express;
  setupLogsUi(httpServer);
  const configService: ConfigService = app.get(ConfigService);
  const port = configService.get<string>('PORT');
  await app.listen(port);
}
bootstrap();
