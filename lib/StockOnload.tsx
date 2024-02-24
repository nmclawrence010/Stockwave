import { fetchStockData, fetchLogo } from "./StockAPIFunctionality";
import { getDatabaseItems } from "./AWSFunctionality";
import { STOCK } from "@/types/stocks";

const dbData: STOCK[] = [];

export async function stockDataOnload() {
  await getDatabaseItems(dbData);

  // Create an array of promises for fetchStockData and fetchLogo
  const promises = dbData.map(async (element) => {
    const currentPrice = await fetchStockData(element.Ticker);
    const logoURL = await fetchLogo(element.Ticker);

    return {
      Ticker: element.Ticker,
      NoShares: element.NoShares,
      AverageCost: element.AverageCost,
      MarketValue: element.NoShares * parseFloat(currentPrice),
      DateBought: element.DateBought,
      CurrentPrice: currentPrice,
      LogoURL: logoURL,
      GainLoss:
        parseFloat(currentPrice) * element.NoShares -
        element.AverageCost * element.NoShares,
    };
  });

  // Wait for all promises to resolve
  const results = await Promise.all(promises);

  // Now 'results' contains the array of objects with resolved values
  console.log(results);
  return results;
}
