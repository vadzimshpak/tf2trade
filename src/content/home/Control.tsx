'use client';

import React from "react";
import {HugeButton} from "@/src/components/buttons/HugeButton";
import {Button} from "@/src/components/buttons/Button";
import {useAppSelector} from "@/src/store/hooks";

import {ShortDescription, TradeDTO} from "@/lib/dto/tradeDTO";
import {Inventory} from "@/lib/interfaces/inventory";

export function Control() {
  const userInventory = useAppSelector(state => state.user.inventory);
  const botInventory = useAppSelector(state => state.bot.inventory);
  const userTotal = useAppSelector(state => state.user.totalAmount);
  const botTotal = useAppSelector(state => state.bot.totalAmount);

  function calcTradeDisabled() {
    if (userTotal === 0 || botTotal === 0) {
      return true;
    }

    if (userTotal < botTotal) {
      return true;
    }

    return false;
  }

  function getSelectedItems(inventory: Inventory) {
    const items: ShortDescription[] = [];

    for (let item of inventory.descriptions) {
      if (!item.selected_assetids) continue;

      items.push({
        classid: item.classid,
        instanceid: item.instanceid,
        assetids: item.selected_assetids,
        market_hash_name: item.market_hash_name,
        icon_url: item.icon_url,
        price_usd: 0
      });
    }

    return items;
  }

  async function trade() {
    if (!userInventory || !botInventory) return;

    const user_items = getSelectedItems(userInventory);
    const bot_items = getSelectedItems(botInventory);

    const response = await fetch('/api/trade', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_items,
        bot_items
      } as TradeDTO)
    });

    const data = await response.json();
    if (data.success) {
      window.location.reload();
      return;
    }

    alert(data.error);
  }

  return (
    <div className="control">
      <HugeButton text="TRADE" disabled={calcTradeDisabled()} onClick={trade} />
      <Button text="Refresh Inventory" onClick={() => window.location.reload()} />
    </div>
  )
}