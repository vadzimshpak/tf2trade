export interface Asset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

export interface Description {
  appid: number;
  assetids: string[];
  selected_assetids: string[];
  classid: string;
  instanceid: string;
  currency: number;
  background_color: string;
  icon_url: string;
  icon_url_large: string;
  tradable: number;
  actions: [
    {
      link: string;
      name: string;
    },
  ];
  name: string;
  name_color: string;
  type: string;
  market_name: string;
  market_hash_name: string;
  commodity: number;
  market_tradable_restriction: number;
  market_marketable_restriction: number;
  marketable: number;
  tags: [
    {
      category: string;
      internal_name: string;
      localized_category_name: string;
      localized_tag_name: string;
      color: string;
    },
  ];
  descriptions: [
    {
      value: string;
      color: string;
      name: string;
    }
  ];
  sealed: number;
  price_usd: number;
  price_keys: number;
  price_metal: number;
  limit: number;
}

export interface Inventory {
  assets: Asset[];
  descriptions: Description[];
  is_some_items_selected: boolean;
  more_items: number;
  last_assetid: string;
  total_inventory_count: number;
  success: number;
  error: string;
  rwgrsn: number;
}
