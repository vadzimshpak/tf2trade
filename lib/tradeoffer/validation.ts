'server only';

import {ETradeState} from "@/lib/enums/trade";

import {User} from "@/lib/generated/prisma/client";
import {ShortDescription} from "@/lib/dto/tradeDTO";
import {Inventory} from "@/lib/interfaces/inventory";

import {createClient} from "redis";
import prisma from "@/lib/prisma";

export function validateItemsValue(user_items: ShortDescription[], bot_items: ShortDescription[]) {
  let userValue = 0;
  let botValue = 0;

  for (const item of user_items) {
    userValue += item.price_usd * item.assetids.length;
  }

  for (const item of bot_items) {
    botValue += item.price_usd * item.assetids.length;
  }

  if (botValue > userValue) throw new Error("Total value is not valid");
}

export async function validateExistTrade(user: User) {
  const existTrade = await prisma.trade.findFirst({
    where: {
      userId: user.id,
      OR: [
        { status: ETradeState.Created },
        { status: ETradeState.Active },
        { status: ETradeState.CreatedNeedsConfirmation },
      ]
    }
  })

  if (existTrade) {
    throw new Error("Trade already exists");
  }
}

export function validateTradelink(user: User) {
  if (!user.tradelink) throw new Error("User tradelink not found");
  const match = user.tradelink.match(/https?:\/\/steamcommunity.com\/tradeoffer\/new\/\?partner=(\d+)&token=(.{8})$/);
  if (!match) throw new Error("User tradelink incorrect");
}

export async function validateItems(steamid: string, items: ShortDescription[]) {
  const client = createClient();
  await client.connect();

  const rawInventory = await client.get(`inventory/${steamid}`);
  if (!rawInventory) throw new Error("Inventory not found");

  const inventory: Inventory = JSON.parse(rawInventory);
  for (const item of items) {
    const desk = inventory.descriptions
      .find(d => d.instanceid === item.instanceid && d.classid === item.classid);

    if (!desk) throw new Error("Inventory item not found");
    for (const assetid of item.assetids) {
      if (!desk.assetids.includes(assetid.toString())) throw new Error("Inventory Asset not found");
    }

    item.price_usd = desk.price_usd;
  }

  return items;
}
