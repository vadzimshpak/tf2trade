import {Inventory} from "@/lib/interfaces/inventory";
import {SteamUser} from "@/lib/interfaces/steamUser";
import {AppID, ContextID} from "@/lib/enums/apps";
import prisma from "@/lib/prisma";
import {createClient} from "redis";
import {GetUnusualID} from "@/lib/unusuals";

export interface GetInventoryParams {
  l: string;
  count: number;
  start_assetid: string;
  appid: AppID;
  contextid: ContextID;
}

/** Ответ IEconItems_440/GetPlayerItems/v1 */
export interface GetPlayerItemsV1Response {
  result: {
    status: number;
    num_backpack_slots: number;
    items: any[];
  };
}

const KEY_VALUE = parseFloat(process.env.KEY_VALUE!);
const STEAM_SIGNIN_APIKEY = process.env.STEAM_SIGNIN_APIKEY!;

export function generateInvParams(appid = 440): GetInventoryParams {
  return {
    l: 'english',
    count: 1500,
    start_assetid: '',
    appid: AppID.TF2,
    contextid: ContextID.Inventory
  }
}

async function getRawInventory(
  steam_user: SteamUser,
): Promise<GetPlayerItemsV1Response> {
  const url = `https://api.steampowered.com/IEconItems_440/GetPlayerItems/v1/?key=${STEAM_SIGNIN_APIKEY}&steamid=${steam_user.steamid}`;
  const response = await fetch(url);
  return (await response.json()) as GetPlayerItemsV1Response;
}

async function getInventoryPart(
  steam_user: SteamUser,
  params: GetInventoryParams,
): Promise<Inventory> {
  const query_params = {
    l: params.l,
    count: String(params.count),
  };

  const params_encoded = new URLSearchParams(query_params).toString();
  const url = `https://steamcommunity.com/inventory/${steam_user.steamid}/${params.appid}/${params.contextid}?${params_encoded}`;
  const response = await fetch(url);

  return (await response.json()) as Inventory;
}

function mergeAssets(inventory: Inventory) {
  if (!inventory.descriptions)
    return inventory;

  inventory.descriptions.map((description) =>
    {
      description.assetids = inventory.assets
        .filter((asset) => asset.classid === description.classid && asset.instanceid === description.instanceid)
        .map((asset) => asset.assetid)
    }
  );


  inventory.descriptions.map((description) => {description.selected_assetids = []})
  inventory.descriptions.map((desk) => {
    if (desk.market_hash_name.includes('Force-a-Nature')) {
      desk.market_hash_name = desk.market_hash_name.replace('Force-a-Nature', 'Force-A-Nature') ;
    }

    for (const tag of desk.tags) {
      if (tag.category !== "Quality" && tag.internal_name !== "Unusual") continue;

      let effect = null;
      if (!desk.descriptions) continue;
      for (const internalDesk of desk.descriptions) {
        if (!internalDesk.value.includes('★ Unusual Effect: ')) continue;
        effect = internalDesk.value.replace('★ Unusual Effect: ', '');
        break;
      }


      if (effect && desk.market_hash_name.includes('Unusual')) {
        desk.market_hash_name = desk.market_hash_name.replace('Unusual ', `Unusual ${effect} `);
        desk.effect_id = GetUnusualID(effect);
      }
    }
  })

  return inventory;
}

export async function getFullInventory(
  steamuser: SteamUser,
  params: GetInventoryParams,
  discount: number = 0,
  isBot: boolean = true
): Promise<Inventory | null> {
  params.count = 75;
  let inventoryA: Inventory | null = await getInventoryPart(steamuser, params);

  if (inventoryA.total_inventory_count > 75) {
    params.count = inventoryA.total_inventory_count;
    console.log(params.count)
    inventoryA = await getInventoryPart(steamuser, params);
  }

  if (!inventoryA) return null;
  if (inventoryA.error) {
    console.log(inventoryA.error);
    return null;
  }

  inventoryA = mergeAssets(inventoryA);
  inventoryA = await pullInventoryPrices(inventoryA, discount);

  return inventoryA;
}

async function pullInventoryPrices(inventoryA: Inventory, discount: number, isBot: boolean = true): Promise<Inventory> {
  if (!inventoryA.descriptions) {
    return inventoryA;
  }

  const names = inventoryA.descriptions.map((description) => description.market_hash_name);
  const uniqueNames = [...new Set(names)];

  const items = await prisma.item.findMany({
    where: {
      market_hash_name: {
        in: uniqueNames
      }
    }
  });

  for (const desk of inventoryA.descriptions) {
    const item = items.find(
      (item) => item.market_hash_name == desk.market_hash_name,
    );

    if (!item) {
      desk.price_usd = 0;
      continue;
    }

    desk.price_usd = isBot ? item.price_sell : item.price_buy;
    desk.price_usd *= (100 - discount) / 100;

    desk.limit = item.limit;
    if (desk.price_usd >= KEY_VALUE) {
      desk.price_keys = Math.floor(desk.price_usd / KEY_VALUE);
      desk.price_metal = ((desk.price_usd / KEY_VALUE) % 1) * KEY_VALUE;
    } else {
      desk.price_keys = 0;
      desk.price_metal = desk.price_usd;
    }
  }

  inventoryA.descriptions = inventoryA.descriptions.filter((item) => (item.price_usd || 0) > 0.9);
  inventoryA.descriptions = inventoryA.descriptions.filter((item) => item.tradable === 1);
  inventoryA.descriptions = inventoryA.descriptions.sort((a, b) => b.price_usd - a.price_usd);

  return inventoryA;
}

export async function applyInventoryLimit(inventory: Inventory) {
  const client = createClient();
  await client.connect();

  const cachedInventory = await client.get(`inventory/${process.env.BOT_STEAMID}`) || '{}';
  const botInventory = JSON.parse(cachedInventory) as Inventory;
  const userItemsCount: any = {};
  const userAvailableItems: any = {};

  if (!inventory.descriptions || !botInventory.descriptions) {
    return inventory;
  }

  // Get all user items with same name
  for (const desk of inventory.descriptions) {
    if (!userItemsCount[desk.market_hash_name])
      userItemsCount[desk.market_hash_name] = 0;

    userItemsCount[desk.market_hash_name] += desk.assetids.length;
  }

  // Calculate available items count
  for (const desk of inventory.descriptions) {
    if (userAvailableItems[desk.market_hash_name])
      continue;

    const botItems = botInventory.descriptions.filter(botDesk => botDesk.market_hash_name === desk.market_hash_name);
    const botItemsCount = botItems.map(item => item.assetids.length);
    const botItemsAmount = botItemsCount.reduce((a, b) => a + b, 0);
    userAvailableItems[desk.market_hash_name] = desk.limit - botItemsAmount;
  }


  // Remove restricted items
  for (const desk of inventory.descriptions) {
    while (userItemsCount[desk.market_hash_name] > userAvailableItems[desk.market_hash_name] && desk.assetids.length > 0) {
      userItemsCount[desk.market_hash_name]--;
      desk.assetids.pop();
    }
  }


  return inventory;
}

/**
 * Оставляет предметы, в названии которых встречается хотя бы одно из ключевых слов (без учёта регистра).
 */
export function filterInventoryByNameKeywords(
  inventory: Inventory,
  keywords: string[],
): Inventory {
  const normalized = keywords
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  if (normalized.length === 0) {
    return inventory;
  }

  const descriptions = inventory.descriptions ?? [];
  if (descriptions.length === 0) {
    return { ...inventory, descriptions: [] };
  }

  const matchesDescription = (d: (typeof descriptions)[number]) => {
    const haystacks = [d.market_hash_name, d.name, d.market_name]
      .filter((s): s is string => Boolean(s))
      .map((s) => s.toLowerCase());
    return haystacks.some((h) =>
      normalized.some((kw) => h.includes(kw)),
    );
  };

  const filteredDescriptions = descriptions.filter(matchesDescription);

  return {
    ...inventory,
    descriptions: filteredDescriptions,
  };
}

