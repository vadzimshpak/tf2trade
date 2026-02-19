import React from "react";

import {TradeStatusContainer} from "@/src/content/home/TradeStatusContainer";

import prisma from "@/lib/prisma";
import {verifySession} from "@/lib/session";
import {Header} from "@/src/layout/Header";
import {Footer} from "@/src/layout/Footer";


export default async function TradePage({params}: {params: { id: string }}) {
  const { id } = await params;
  const session = await verifySession();
  var trade = null;
  if (session) {
    trade = await prisma.trade.findFirst({ where: { id: parseInt(id), userId: session.id } })
  }

  return (
    <div className="home">
      <Header />
      {
        trade
          ?
            <div className="home__body">
              <TradeStatusContainer trade={trade} />
            </div>
          : null
      }
      <Footer />
    </div>

  )
}