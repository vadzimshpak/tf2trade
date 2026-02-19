import prisma from "@/lib/prisma";
import * as cheerio from "cheerio";

const REF_VALUE = 0.03; // value in refs
const KEY_VALUE = 56.22;

interface Price {

}

const cookie = "__Secure-connect.sid=s%3AasahNliVf3ckInqPEw8i_p1yLQUiJGPE.a6YzPZjs1Gn6%2BGoNVW7ku8LXz7xfVo7UM7Le9veZ80s; return=%2Fdiscord"

async function fetchPrices(market_hash_name: string) {
  const response = await fetch(`https://gladiator.tf/sales?item=${market_hash_name}`, {
    headers: {
      'Cookie': cookie
    }
  });
  const body = await response.text();
  const $ = cheerio.load(body);

  const sold = $('.card-body .col-sm-6:first-child');
  const bought = $('.card-body .col-sm-6:not(:first-child)');

  let sells = null;
  let boughts = null;

  const boughtHeader = $(bought).find('h5');

  console.log($(bought).find('h5').length)

  for (let i = 0; i < boughtHeader.length; i++) {
    if (boughtHeader.eq(i).text() === 'Past 30 days') {
      boughts = $(bought).find('ul').last().find('li');
    }
  }

  let totalAmount = 0;
  let totalValue = 0;

  if (boughts) {
    for (let i = 0; i < boughts.length; i++) {
      const row = boughts
                          .eq(i)
                          .text()
                          .replaceAll(' ', '')
                          .replace('ref', '');

      const rowSplit = row.split('@');
      const valueSplit = rowSplit[1].split('keys');

      totalAmount += parseInt(rowSplit[0]);
      if (valueSplit.length == 1) {
        totalValue += parseFloat(valueSplit[0]) * parseInt(rowSplit[0]);
      } else {
        totalValue += parseFloat(valueSplit[0] || '0') * parseInt(rowSplit[0]) * KEY_VALUE + parseFloat(valueSplit[1] || '0');
      }
    }
  }

  if (totalAmount == 0 || totalValue == 0) {
    return 0
  }

  return parseFloat((totalValue/totalAmount).toFixed(2));
}

async function updatePrice(market_hash_name: string) {
  const result = await fetchPrices(market_hash_name);
  console.log(result, 'refs')

  await prisma.item.update({
    where: {
      market_hash_name
    },
    data: {
      price_usd: result
    }
  })
}

(async () => {
  for (let i = 0; true; i += 100) {
    const items = await prisma.item.findMany({
      take: 100,
      skip: i,
    })

    if (!items) break;

    for (let item of items) {
      if (item.market_hash_name.includes('(')) continue;
      await updatePrice(item.market_hash_name);
    }
  }
})();
