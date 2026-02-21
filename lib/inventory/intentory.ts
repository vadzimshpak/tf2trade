import {Inventory} from "@/lib/interfaces/inventory";
import {SteamUser} from "@/lib/interfaces/steamUser";
import {AppID, ContextID} from "@/lib/enums/apps";
import prisma from "@/lib/prisma";

export interface GetInventoryParams {
  l: string;
  count: number;
  start_assetid: string;
  appid: AppID;
  contextid: ContextID;
}

export function generateInvParams(appid = 440): GetInventoryParams {
  return {
    l: 'english',
    count: 1500,
    start_assetid: '',
    appid: AppID.TF2,
    contextid: ContextID.Inventory
  }
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

function mergeInventories(inventoryA: Inventory, inventoryB: Inventory): Inventory {
  // Merge assets
  inventoryA.assets = Array.from(
    new Map([...inventoryA.assets, ...inventoryB.assets]
      .map(asset => [asset.appid, asset])).values()
  );

  // Merge descriptions
  inventoryA.descriptions = Array.from(
    new Map([...inventoryA.descriptions, ...inventoryB.descriptions]
      .map(description => [`${description.classid}-${description.instanceid}`, description])).values()
  );

  return inventoryA;
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

  return inventory;
}

export async function getFullInventory(
  steamuser: SteamUser,
  params: GetInventoryParams,
  discount: number = 0
): Promise<Inventory | null> {
  params.count = 1500; // Inventory.tsx half

  let inventoryA = await getInventoryPart(steamuser, params);
  if (!inventoryA) return null;
  if (inventoryA.error) {
    console.log(inventoryA.error);
    return null;
  }

  if (inventoryA.more_items === 1) {
    params.start_assetid = inventoryA.last_assetid;
    let inventoryB = await getInventoryPart(steamuser, params);
    inventoryA = mergeInventories(inventoryA, inventoryB);
  }

  inventoryA = await pullInventoryPrices(inventoryA, discount);

  return mergeAssets(inventoryA);
}

async function pullInventoryPrices(inventoryA: Inventory, discount: number): Promise<Inventory> {
  if (!inventoryA.descriptions) {
    return inventoryA;
  }

  let undefinedItems = [];

  const items = await prisma.item.findMany();
  for (const desk of inventoryA.descriptions) {
    const item = items.find(
      (item) => item.market_hash_name == desk.market_hash_name,
    );
    if (!item) {
      undefinedItems.push({
        market_hash_name: desk.market_hash_name,
        price_usd: 0
      })
      desk.price_usd = 0;
      continue;
    }

    desk.price_usd = (item.price_usd || 0) * (100 - discount) / 100;
  }

  await prisma.item.createMany({data: undefinedItems, skipDuplicates: true})
  inventoryA.descriptions = inventoryA.descriptions.filter((item) => (item.price_usd || 0) > 0);
  inventoryA.descriptions = inventoryA.descriptions.filter((item) => item.tradable);
  inventoryA.descriptions = inventoryA.descriptions.sort((a, b) => b.price_usd - a.price_usd);

  return inventoryA;
}
