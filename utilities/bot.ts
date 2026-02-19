import {Trade, User} from "@/lib/generated/prisma/client";
import {ShortDescription} from "@/lib/dto/tradeDTO";
import {AppID, ContextID} from "@/lib/enums/apps";

import SteamUser, {ETradeOfferState} from "steam-user";
import SteamTOTP from "steam-totp";
import TradeOfferManager from "steam-tradeoffer-manager";
import SteamCommunity from "steamcommunity";

import prisma from "@/lib/prisma";
import TradeOffer from "steam-tradeoffer-manager/lib/classes/TradeOffer";
import {generateInvParams, getFullInventory} from "@/lib/inventory/intentory";
import {createClient} from "redis";
import {Inventory} from "@/lib/interfaces/inventory";

const LOGIN = process.env.BOT_LOGIN!;
const PASSWORD = process.env.BOT_PASSWORD!;
const SHARED_SECRET = process.env.BOT_SHARED_SECRET!;
const IDENTITY_SECRET = process.env.BOT_IDENTITY_SECRET!;
const STEAMID = process.env.BOT_STEAMID!;

const steamUser = new SteamUser();
const community = new SteamCommunity();
var manager: TradeOfferManager | null = null;

steamUser.logOn({
  accountName: LOGIN,
  password: PASSWORD,
  twoFactorCode: SteamTOTP.generateAuthCode(SHARED_SECRET),
})

steamUser.on('webSession', (sessionID, cookies) => {
  console.info(`Bot websession: ${sessionID}`);
  manager = new TradeOfferManager({
    steam: steamUser,
    community: community,
    domain: "tftrade.net",
    language: "en",
    cancelTime: 1000 * 60 * 10 // 10 minutes
  });

  community.setCookies(cookies);
  manager.setCookies(cookies);

  manager.on('sentOfferChanged', async (offer: TradeOffer, oldState) => {
    console.log(`Sent offer #${offer.id} changed: from ${oldState} to ${offer.state}`);
    let message = "";
    if (offer.state === ETradeOfferState.Invalid) message = "Invalid offer";
    if (offer.state === ETradeOfferState.Active) message = "Offer sent";
    if (offer.state === ETradeOfferState.Accepted) message = "Offer accepted";
    if (offer.state === ETradeOfferState.Countered) message = "Offer countered";
    if (offer.state === ETradeOfferState.Expired) message = "Offer expired";
    if (offer.state === ETradeOfferState.Canceled) message = "Offer canceled";
    if (offer.state === ETradeOfferState.Declined) message = "Offer declined";
    if (offer.state === ETradeOfferState.InvalidItems) message = "Invalid items";
    if (offer.state === ETradeOfferState.CreatedNeedsConfirmation) message = "Offer waits for confirmation";
    if (offer.state === ETradeOfferState.CanceledBySecondFactor) message = "Offer canceled by second factor";
    if (offer.state === ETradeOfferState.InEscrow) message = "Offer in escrow";

    await prisma.trade.update({
      where: {tradeoffer_id: offer.id},
      data: {
        status: offer.state,
        message: message
      },
    })
  });
})

steamUser.on('loggedOn', () => {
  console.info(`Bot logged in, creating manager`);
})



export async function createTradeoffer(user: User, user_items: ShortDescription[], bot_items: ShortDescription[]) {
  if (!manager) return;
  const offer = manager.createOffer(user.tradelink!);

  // await new Promise((resolve, reject) => {
  //   offer.getUserDetails((err, me, them) => {
  //     if (err) return reject(err);
  //     if (me.escrowDays > 0) return reject(new Error(`Fail! Bot have escrow for ${me.escrowDays} days`));
  //     if (them.escrowDays > 0) return reject(new Error(`Fail! You have escrow for ${them.escrowDays} days`));
  //
  //     resolve({me, them});
  //   })
  // });


  for (const item of bot_items) {
    for (const assetid of item.assetids) {
      // @ts-ignore
      offer.addMyItem({
        assetid: assetid,
        appid: AppID.TF2,
        contextid: ContextID.Inventory,
        amount: 1
      })
    }
  }

  for (const item of user_items) {
    for (const assetid of item.assetids) {
      // @ts-ignore
      offer.addTheirItem({
        assetid: assetid,
        appid: AppID.TF2,
        contextid: ContextID.Inventory,
        amount: 1
      })
    }
  }

  const status =  await new Promise((resolve, reject) => {
    offer.send((err, status) => {
      if (err) return reject(err);
      resolve(status);
    })
  });

  await new Promise((resolve, reject) => {
    offer.update((err) => {
      if (err) return reject(err);
      resolve(true);
    })
  });

  if (status === 'pending') {
    console.log('Confirming offer');
    await new Promise((resolve, reject) => {
      community.acceptConfirmationForObject(IDENTITY_SECRET, offer.id, (err) => {
        if (err) return reject(err);
        resolve("Success confirmation");
      })
    })
  }

  if (!offer.id) throw new Error("Could not get tradeoffer id.");

  return offer;
}

async function refreshInventory() {
  const inventory = await getFullInventory({id: 1, steamid: STEAMID}, generateInvParams());
  if (!inventory) {
    console.error("Failed to refresh bot inventory");
    console.log(inventory)
    return false;
  }

  const client = createClient();
  await client.connect();

  await client.set(`inventory/${STEAMID}`, JSON.stringify(inventory));

  console.info("Inventory refreshed!");
  return true;
}

async function removeItems(trade: Trade) {
  const client = createClient();
  await client.connect();

  const cacheInventory = await client.get(`inventory/${STEAMID}`);
  if (!cacheInventory) return;

  const inventory = JSON.parse(cacheInventory) as Inventory;
  const botTradeItems = JSON.parse(JSON.stringify(trade.bot_items)) as ShortDescription[];
  for (const item of inventory.descriptions) {
    for (const botTradeItem of botTradeItems) {
      if (item.classid === botTradeItem.classid && item.instanceid === botTradeItem.instanceid) {
        for (const assetid of botTradeItem.assetids) {
          item.assetids = item.assetids.filter((a) => a !== assetid);
        }
      }
    }
  }
  await client.set(`inventory/${STEAMID}`, JSON.stringify(inventory));
}

(async () => {
  console.log("Bot warmup...")
  let cycles = 0;
  await new Promise<void>(resolve => setTimeout(resolve, 10_000));

  while (true) {
    const trade = await prisma.trade.findFirst({where: {status: 0}})
    if (!trade) {
      if (cycles > 100 && await refreshInventory()) {
        cycles = 0;
      }
      await new Promise<void>(resolve => setTimeout(resolve, 3000));
      cycles++;
      continue;
    }

    cycles++;

    console.info(`Working with offer: ${trade.id}`);
    const user = await prisma.user.findFirst({where: {id: trade.userId}});
    const user_items = JSON.stringify(trade.user_items);
    const bot_items = JSON.stringify(trade.bot_items);
    try {
      const offer = await createTradeoffer(user!, JSON.parse(user_items), JSON.parse(bot_items));
      if (!offer) throw new Error(`Empty tradeoffer #${trade.id}`);

      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          tradeoffer_id: offer.id,
          status: ETradeOfferState.Active,
          message: "Offer sent"
        }
      });

      await removeItems(trade);
    } catch (e) {
      let message = 'Unexpected error';
      if (e instanceof Error) {
        message = `Error while creating offer #${trade.id} - ${e.message}`;
      }

      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          status: ETradeOfferState.Invalid,
          error: message,
          message: "Offer rejected"
        }
      })
    }
  }
})()

