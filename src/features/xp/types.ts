export interface XPResult {

  current_vxp: number;

  lifetime_vxp: number;

  level: number;

  badge_name: string;

}

export interface AddXPInput {

  userId: string;

  amount: number;

  reason?: string;

}