import React from "react";
import {Inventory} from "@/lib/interfaces/inventory";
import {generateInvParams, getFullInventory} from "@/lib/inventory/intentory";
import {
  BotAutoChoose,
  BotMainInventory,
  BotSelectedInventory,
  BotTotalAmount
} from "@/src/content/home/inventory/Inventory";
import {SteamUser} from "@/lib/interfaces/steamUser";

import { createClient } from 'redis';

export async function BotInventory() {
  const bot: SteamUser = {id: 1, steamid: "76561198892652425"};

  const client = createClient();
  await client.connect();

  const cacheInventory = await client.get(`inventory/${bot.steamid}`);

  let inventory: Inventory | null;
  if (cacheInventory) {
    inventory = JSON.parse(cacheInventory) as Inventory;
    console.log('Using cache inventory for ', bot.steamid)
  } else {
    inventory = await getFullInventory(bot, generateInvParams(), -5);
    await client.set(`inventory/${bot.steamid}`, JSON.stringify(inventory));
  }

  return (
    <div className="inventory">
      {/* Selected items */}
      <div className="inventory__selected inventory-block">
        <div className="inventory-block__header">
          <BotTotalAmount />
          <span>BOT OFFER</span>
        </div>
      </div>

      <div className="inventory__selected inventory-block">
        <BotSelectedInventory />
      </div>

      {/* All items here */}
      <div className="inventory__main inventory-block min-h-[30rem]">
        <div className="inventory-block__header">
          {/*<span>*/}
          {/*  <Button text="Sort by"/>*/}
          {/*</span>*/}
          {/*<input placeholder="Search" value={searchTerm} onChange={setSearchTerm} />*/}
          <BotAutoChoose />
          <span>BOT INVENTORY</span>
        </div>

        <hr />

        <BotMainInventory inventory={inventory} />
      </div>
    </div>
  )
}