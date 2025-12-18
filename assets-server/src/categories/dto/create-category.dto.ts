export class CreateCategoryDto {
  readonly name: string;
  readonly options?: Array<{
    name: string;
    code: string;
  }>;
}
