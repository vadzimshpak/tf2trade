import React from "react";

import {LoginBanner, SteamBrokenBanner, TradelinkBanner} from "@/src/content/home/userbanners/UserBanners";

import {Inventory} from "@/lib/interfaces/inventory";
import {verifySession} from "@/lib/session";
import {
  UserForceRefresh,
  UserMainInventory,
  UserSelectedInventory,
  UserTotalAmount
} from "@/src/content/home/inventory/Inventory";
import {applyInventoryLimit, generateInvParams, getFullInventory} from "@/lib/inventory/intentory";
import {createClient} from "redis";


export async function UserInventory() {
  const user = await verifySession();

  let inventory: Inventory | null = null;
  if (user) {
    const client = createClient();
    await client.connect();

    const cacheInventory = await client.get(`inventory/${user.steamid}`);


    if (cacheInventory) {
      inventory = JSON.parse(cacheInventory) as Inventory;
      inventory = await applyInventoryLimit(inventory);
      console.log('Using cache inventory for ', user.steamid)
    } else {
      inventory = await getFullInventory(user, generateInvParams(), 5);
      if (inventory)
        inventory = await applyInventoryLimit(inventory);

      await client.set(`inventory/${user.steamid}`, JSON.stringify(inventory), {EX: 1000 * 60 * 60}); // Expires in hour
    }
  }

  return (
    <div className="inventory">
      <div className="inventory__selected inventory-block">
        <div className="inventory-block__header">
          <span>YOUR OFFER</span>
          <UserTotalAmount />
        </div>
      </div>

      <div className="inventory__selected inventory-block">
        <UserSelectedInventory />
      </div>

      <div className="inventory__main inventory-block  min-h-[300px]">
        <div className="inventory-block__header">
          <span>YOUR INVENTORY</span>
          {/*<span>*/}
          {/*  <Button text="Sort by"/>*/}
          {/*</span>*/}

          {/*<input placeholder="Search" value={searchTerm} onChange={setSearchTerm} />*/}
          <UserForceRefresh />
        </div>

        <hr className="mt-2 mb-2"/>

        <LoginBanner />
        <TradelinkBanner />
        <SteamBrokenBanner />

        <UserMainInventory inventory={inventory} />
      </div>
    </div>
  )
}