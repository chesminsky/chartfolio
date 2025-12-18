export enum UserPlan {
  Free = 'free',
  Pro = 'pro'
}

export interface DataLimits {
  [UserPlan.Free]: number;
  [UserPlan.Pro]: number;
}

export interface UserLimits {
  assets: number;
  categories: number;
}
