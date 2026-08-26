export interface Bid {
  id: string;
  rank: number;
  name: string;
  handle: string;
  message: string;
  avatarUrl: string;
  amount: number;
  isUrl: boolean;
  clicks: number;
  instagram?: string;
  x?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  promoteText?: string;
  promoteUrl?: string;
  productLinkText?: string;
  productLinkUrl?: string;
  color?: string;
  timestamp: Date;
}
