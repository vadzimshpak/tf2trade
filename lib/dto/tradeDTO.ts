export interface ShortDescription {
  classid: string;
  instanceid: string;
  assetids: string[];
  market_hash_name: string;
  icon_url: string;
  price_usd: number;
}

export interface TradeDTO {
  bot_items: ShortDescription[];
  user_items: ShortDescription[];
}