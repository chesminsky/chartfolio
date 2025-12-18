export class CreateAssetDto {
  readonly name: string;
  readonly parentId: string;
  readonly value?: number;
  readonly code?: string;
  readonly type?: 'Fiat' | 'Stocks' | 'Crypto';
}