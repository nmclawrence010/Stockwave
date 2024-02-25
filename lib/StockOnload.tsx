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
      TotalPaid: element.AverageCost * element.NoShares,
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

  // Calculate total Gain/Loss
  const unrealisedGainLoss = results.reduce(
    (sum, result) => sum + result.GainLoss,
    0,
  );

  // Calculate total paid to use for the overall percentage gain
  const totalTotalPaid = results.reduce(
    (sum, result) => sum + result.TotalPaid,
    0,
  );

  // Calculate total paid to use for the overall percentage gain
  const totalPercentageGain = (unrealisedGainLoss / totalTotalPaid) * 100;

  // Now 'results' contains the array of objects with resolved values
  console.log(results[0]["Ticker"]);
  console.log(unrealisedGainLoss);
  return { results, unrealisedGainLoss, totalPercentageGain };
}
