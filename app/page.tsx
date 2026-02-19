import React from "react";

import {Header} from "@/src/layout/Header";
import {Footer} from "@/src/layout/Footer";

import {UserInventory} from "@/src/content/home/UserInventory";
import {Control} from "@/src/content/home/Control";
import {BotInventory} from "@/src/content/home/BotInventory";
import {verifySession} from "@/lib/session";

import prisma from "@/lib/prisma";
import {redirect} from "next/navigation";
import {ETradeState} from "@/lib/enums/trade";

export default async function Home() {
  const session = await verifySession();
  if (session) {
    const trade = await prisma.trade.findFirst({
      where: {
        userId: session.id,
        OR: [
          { status: ETradeState.Created },
          { status: ETradeState.Active },
          { status: ETradeState.CreatedNeedsConfirmation },
        ]
      }
    })

    if (trade)
      redirect(`/trade/${trade.id}`);
  }

  return (
    <main className="home">
      <Header />
      <div className="home__body">
        <UserInventory />
        <Control />
        <BotInventory />
      </div>
      <Footer />
    </main>
  );
}
