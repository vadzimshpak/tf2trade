'use client';

import React from "react";
import {Description} from "@/lib/interfaces/inventory";

interface ItemProps {
  description: Description;
  selected: boolean;
  onClick: () => void;
}


export default function Item(props: ItemProps) {
  function getQualityColor() {
    for (let tag of props.description.tags) {
      if (tag.category === "Quality")
      {
        return `linear-gradient(0deg,rgba(46, 43, 35, 0) 0%, rgba(78, 73, 43, 0.3) 40%, #${tag.color} 100%)`;
      }
    }

    return "#ffffff";
  }

  return (
    <div className="item">
      <span className="item__price">
        {props.description.price_keys} keys
        <br/>
        {props.description.price_metal?.toFixed(2)} refs
      </span>

      <div className="item__body" onClick={props.onClick}>
        <div className="item__body-quality" style={{background: getQualityColor()}}>
          {props.selected
            ? <span className="item__body-amount">{props.description.selected_assetids.length}х</span>
            : <span className="item__body-amount">{props.description.assetids.length}х</span>
          }
          {
            props.description.effect_id
              ? <img className="item__body-img" src={`https://marketplace.tf/images/particles/${props.description.effect_id}_380x380.png`} alt=""/>
              : null
          }
          <img className="item__body-img" src={`https://community.fastly.steamstatic.com/economy/image/${props.description.icon_url}/225x225?allow_animated=1`} alt=""/>
          <span className="item__body-name">{props.description.market_hash_name}</span>
        </div>
      </div>
    </div>
  )
}