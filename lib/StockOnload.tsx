import { fetchStockData, fetchLogo } from "./StockAPIFunctionality";
import { getDatabaseItems } from "./AWSFunctionality";
import { STOCK } from "@/types/stocks";
import { PORTFOLIORECORD } from "@/types/userPortfolio";

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
  var results = await Promise.all(promises);

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

  const overallGainLoss = unrealisedGainLoss + realisedGainLoss; // Overall gain

  // Total paid for the unrealised gains to be used for calculating the gain percentage
  const totalTotalPaid = results.reduce(
    (sum, result) => sum + result.TotalPaid,
    0,
  );

  //Percentage calcs for the overall portfolio
  const unrealisedPercentageGain = (unrealisedGainLoss / totalTotalPaid) * 100; // Unrealised gain %
  const realisedPercentageGain = (realisedGainLoss / totalTotalPaid) * 100; // Realised gain %
  const overallGainLossPercentage = realisedPercentageGain * 2; // Overall gain %

  //Aggregating rows from results to display different transactions on the same stock together to show your overall position
  const aggregatedData = results.reduce(
    (result: Array<PORTFOLIORECORD>, currentItem) => {
      const existingItem = result.find(
        (item) => item.Ticker === currentItem.Ticker,
      );

      if (existingItem) {
        // If a matching Ticker is found, update the values
        existingItem.NoShares += currentItem.NoShares;
        existingItem.TotalPaid += currentItem.TotalPaid;
        existingItem.MarketValue += currentItem.MarketValue;
        existingItem.AverageCost =
          existingItem.TotalPaid / existingItem.NoShares;
      } else {
        // If no matching Ticker is found, add the current item to the result
        result.push({ ...currentItem });
      }

      return result;
    },
    [],
  );

  // Extract Ticker and MarketValue for ChartThree (Donut Chart)
  const chartThreeData = {
    labels: aggregatedData.map((item) => item.Ticker),
    series: aggregatedData.map((item) => item.MarketValue),
  };

  return {
    results,
    unrealisedGainLoss,
    unrealisedPercentageGain,
    realisedGainLoss,
    realisedPercentageGain,
    overallGainLoss,
    overallGainLossPercentage,
    aggregatedData,
    chartThreeData,
  };
}
