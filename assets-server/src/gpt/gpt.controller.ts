import { Controller, Get, Query } from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { apiUrl } from 'src/config';
import { GPTService } from './gpt.service';

@Controller(`${apiUrl}/guess`)
export class GPTController {
  constructor(private gpt: GPTService) {}

  @Get(`categories`)
  getLatest(@Query() query: { assetName: string; assetCode: string; assetType: string }): Observable<any> {
    return from(this.gpt.quote(query.assetName, query.assetCode, query.assetType));
  }
}
