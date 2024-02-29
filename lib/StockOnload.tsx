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
      SoldGainLoss: 100,
      TransactionID: element.TransactionID,
    };
  });

  // Wait for all promises to resolve
  const results = await Promise.all(promises);

  // Unrealised
  const unrealisedGainLoss = results.reduce(
    (sum, result) => sum + result.GainLoss,
    0,
  );

  // Realised
  const realisedGainLoss = results.reduce(
    (sum, result) => sum + result.SoldGainLoss,
    0,
  );

  // Overall gain (Realised and Unrealised)
  const overallGainLoss = unrealisedGainLoss + realisedGainLoss;

  // Total paid for the unrealised gains to be used for calculating the gain percentage
  const totalTotalPaid = results.reduce(
    (sum, result) => sum + result.TotalPaid,
    0,
  );

  // Unrealised gain %
  const unrealisedPercentageGain = (unrealisedGainLoss / totalTotalPaid) * 100;

  // Realised gain %
  const realisedPercentageGain = (realisedGainLoss / totalTotalPaid) * 100;

  // Overall gain %
  const overallGainLossPercentage = realisedPercentageGain * 2;

  // Now 'results' contains the array of objects with resolved values
  console.log(results[0]["Ticker"]);
  console.log(unrealisedGainLoss);
  return {
    results,
    unrealisedGainLoss,
    unrealisedPercentageGain,
    realisedGainLoss,
    realisedPercentageGain,
    overallGainLoss,
    overallGainLossPercentage,
  };
}
