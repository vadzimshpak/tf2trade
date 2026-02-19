import {NextRequest, NextResponse} from "next/server";

import {verifySession} from "@/lib/session";
import {TradeDTO} from "@/lib/dto/tradeDTO";

import prisma from "@/lib/prisma";
import {validateExistTrade, validateItems, validateItemsValue, validateTradelink} from "@/lib/tradeoffer/validation";
import {ETradeState} from "@/lib/enums/trade";


export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({success: false, error: "No user session found."});
  }

  const bot = await prisma.bot.findFirst({
    where: {
      steamid: process.env.BOT_STEAMID!
    }
  });
  const user = await prisma.user.findFirst({
    where: {
      steamid: session.steamid
    }
  });

  if (!bot || !user) {
    return NextResponse.json({success: false, error: "No user found."});
  }


  const body = (await req.json()) as TradeDTO;

  try {
    var userValidatedItems = await validateItems(user.steamid, body.user_items);
    var botValidatedItems = await validateItems(bot.steamid, body.bot_items);
    await validateExistTrade(user);
    validateItemsValue(userValidatedItems, botValidatedItems);
    validateTradelink(user);

  }
  catch(e) {
    if (e instanceof Error) {
      return NextResponse.json({success: false, error: e.message});
    }

    return NextResponse.json({success: false, error: "Unknown error."});
  }

  await prisma.trade.create({
    data: {
      bot: {
        connect: {
          id: bot.id
        }
      },
      user: {
        connect: {
          id: user.id
        }
      },
      user_items: JSON.parse(JSON.stringify(userValidatedItems)),
      bot_items: JSON.parse(JSON.stringify(botValidatedItems)),
      status: ETradeState.Created,
      tradeoffer_id: "0",
      error: null,
      message: "Offer created"
    }
  })

  return NextResponse.json({success: true});
}