import prisma from "@/lib/prisma";
import {readFileSync} from "fs";
import {Item} from "@/lib/generated/prisma/client";

const KEY_VALUE = parseFloat(process.env.KEY_VALUE!);
const API_KEY = process.env.STN_APIKEY;

async function updateSchema() {
  const file = readFileSync('utilities/output.json', 'utf8');
  const schema = JSON.parse(file);

  const items = [];
  for (const item of schema.result.schema) {
    items.push({
      market_hash_name: item,
      limit: 0,
      price_buy: 0,
      price_sell: 0
    });
  }

  await prisma.item.createMany({
    data: items,
    skipDuplicates: true
  })
}

async function updatePrice(item: Item) {
  const response = await fetch(`https://api.stntrading.eu/GetItemDetails/v1?full_name=${item.market_hash_name}&apikey=${API_KEY}`);
  const json = await response.json();

  if (json.success != 1) {
    console.error("CANT FIND PRICE FOR: ", item.market_hash_name);
    return;
  }

  console.log('updating: ', item.market_hash_name);
  await prisma.item.update({
    where: {id: item.id},
    data: {
      limit: json.item.stock.limit,
      level: json.item.stock.level,
      level_for_qb: json.item.stock.level_for_quick_buy,
      price_sell: json.item.pricing.sell.keys * KEY_VALUE + json.item.pricing.sell.metal,
      price_buy: json.item.pricing.buy.keys * KEY_VALUE + json.item.pricing.buy.metal,
    }
  })
}

(async () => {
  // await updateSchema();
  const items = await prisma.item.findMany({where: {updated_at: null}});

  let promises = [];
  for (const item of items) {
    promises.push(updatePrice(item));
    if (promises.length > 10)
    {
      await Promise.all(promises);
      promises = [];
    }
  }
})();
