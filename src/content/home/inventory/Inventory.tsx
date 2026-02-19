'use client';

import React, {useEffect} from "react";
import Item from "@/src/components/item/Item";
import {Inventory} from "@/lib/interfaces/inventory";

import {useAppDispatch, useAppSelector} from "@/src/store/hooks";
import {moveBotItemToBody, moveBotItemToSelected, setBotInventory} from "@/src/store/botSlice";
import {moveUserItemToBody, moveUserItemToSelected, setUserInventory} from "@/src/store/userSlice";
import {Button} from "@/src/components/buttons/Button";
import {store} from "@/src/store/store";

interface InventoryProps {
  inventory: Inventory | null
}

export function BotMainInventory(props: InventoryProps) {
  const inventory = useAppSelector(state => state.bot.inventory);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setBotInventory(props.inventory));
  }, [dispatch, props.inventory]);

  return (
    <div className="inventory-block__items">
      {
        inventory?.descriptions?.map((itemDescription, index) => (
          itemDescription.assetids?.length > 0
            ? <Item key={index}
                    description={itemDescription}
                    selected={false}
                    onClick={() => dispatch(moveBotItemToSelected(itemDescription))}
            />
            : null
        ))
      }
    </div>
  )
}

export function BotSelectedInventory() {
  const inventory = useAppSelector(state => state.bot.inventory);
  const selectedCount = useAppSelector(state => state.bot.selectedItems);
  const dispatch = useAppDispatch();


  return (
    <div className="inventory-block__items">
      {
        selectedCount > 0
          ?
            inventory?.descriptions?.map((itemDescription, index) => (
              itemDescription.selected_assetids?.length > 0
                ? <Item key={index}
                        description={itemDescription}
                        selected={true}
                        onClick={() => dispatch(moveBotItemToBody(itemDescription))}
                />
                : null
            ))
          : <span className="inventory-block__alert">Select some items from inventory below</span>
      }
    </div>
  )
}

export function BotTotalAmount() {
  const totalAmount = useAppSelector(state => state.bot.totalAmount);

  return (
    <span>
      {totalAmount.toFixed(2)} refs
    </span>
  )
}

export function BotAutoChoose() {
  const botInventory = useAppSelector(state => state.bot.inventory);
  const dispatch = useAppDispatch();

  function autoChoose() {
    if (!botInventory) return;
    let currentState = store.getState();

    for (const item of botInventory.descriptions) {
      if (item.price_usd > currentState.user.totalAmount - currentState.bot.totalAmount) continue;
      for (const assetid of item.assetids)
      {
        dispatch(moveBotItemToSelected(item));
        currentState = store.getState();
        if (currentState.bot.totalAmount >= currentState.user.totalAmount) return;
      }
    }
  }

  return (
    <span>
      <Button text="Auto choose" onClick={autoChoose} />
    </span>
  )
}

export function UserMainInventory(props: InventoryProps) {
  const inventory = useAppSelector(state => state.user.inventory);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUserInventory(props.inventory));
  }, [dispatch, props.inventory]);

  return (
    <div className="inventory-block__items">
      {
        inventory?.descriptions?.map((itemDescription, index) => (
          itemDescription.assetids?.length > 0
            ? <Item key={index}
                    description={itemDescription}
                    selected={false}
                    onClick={() => dispatch(moveUserItemToSelected(itemDescription))}
            />
            : null
        ))
      }
    </div>
  )
}

export function UserSelectedInventory() {
  const inventory = useAppSelector(state => state.user.inventory);
  const selectedCount = useAppSelector(state => state.user.selectedItems);
  const dispatch = useAppDispatch();


  return (
    <div className="inventory-block__items">
      {
        selectedCount > 0
          ?
          inventory?.descriptions?.map((itemDescription, index) => (
            itemDescription.selected_assetids?.length > 0
              ? <Item key={index}
                      description={itemDescription}
                      selected={true}
                      onClick={() => dispatch(moveUserItemToBody(itemDescription))}
              />
              : null
          ))
          : <span className="inventory-block__alert">Select some items from inventory below</span>
      }
    </div>
  )
}

export function UserTotalAmount() {
  const totalAmount = useAppSelector(state => state.user.totalAmount);

  return (
    <span>
      {totalAmount.toFixed(2)} refs
    </span>
  )
}

export function UserForceRefresh() {
  async function forceRefresh() {
    const response = await fetch('/api/user/forcerefresh');
    const data = await response.json();
    if (data.success) {
      window.location.reload();
      return;
    }

    alert('Failed to refresh');
  }

  return (
    <span>
      <Button text="Force refresh" onClick={forceRefresh} />
    </span>
  )
}