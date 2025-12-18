import { Controller, Get } from '@nestjs/common';
import { apiUrl } from './config';

@Controller(`${apiUrl}`)
export class AppController {
  constructor() {}

  @Get('version')
  getVersion() {
    return {
      version: process.env.npm_package_version
    };
  }
}
