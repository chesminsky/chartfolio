export class CreateUserDto {
  readonly username: string;
  readonly email: string;
  readonly verified: boolean;
  readonly password?: string;
  readonly googleId?: string;
  readonly facebookId?: string;
  readonly picture?: string;
}

export interface AssetCategoryMap {
  [key: string]: { [key: string]: number }; // categoryId to map of options
}

export interface CategoryMap {
  [key: string]: AssetCategoryMap; // asset code to asset category map
}

export interface SettingsMap {
  [key: string]: any;
}
