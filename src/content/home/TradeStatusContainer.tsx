'use client';

import {Button} from "@/src/components/buttons/Button";

import {Trade} from "@/lib/generated/prisma/client";

interface TradeProps {
  trade: Trade;
}

export async function TradeStatusContainer(props: TradeProps) {
  return (
    <div className="trade-status-container">
      <div className="trade-status-container__header">
        <h2>TradeID: {props.trade.tradeoffer_id}</h2>
      </div>
      <div className="trade-status-container__body">
        <div className="banner">
          <div className="banner__header">
            Status: { props.trade.status }
          </div>
          <div className="banner__body">
            Click on button below to open trade!
            <br/>
            Message: {props.trade.message || "None"}
            <br/>
            Error: {props.trade.error || "None"}
          </div>
          <Button text="Click" newWindow={true} link={`https://steamcommunity.com/tradeoffer/${props.trade.tradeoffer_id}`} />
        </div>
      </div>
      <div className="trade-status-container__footer">
        <div className="banner">
          <div className="banner__action">
            <Button text="Refresh" onClick={() => window.location.reload()} />
          </div>
        </div>
      </div>
    </div>
  )
}