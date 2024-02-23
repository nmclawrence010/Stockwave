import { fetchStockData, fetchLogo } from "./StockAPIFunctionality";
import { getDatabaseItems } from "./AWSFunctionality";
import { STOCK } from "@/types/stocks";
import { PORTFOLIORECORD } from "@/types/userPortfolio";

const dbData: STOCK[] = [];
const userPortfolio: any[] = [];

export async function stockDataOnload() {
  await getDatabaseItems(dbData);
  // console.log(dbData.length);
  // console.log("DBDATA", dbData[0].Ticker);
  dbData.forEach((element, index, array) => {
    var obj = {
      Ticker: element.Ticker,
      NoShares: element.NoShares,
      AverageCost: element.AverageCost,
      MarketValue: element.MarketValue,
      DateBought: element.DateBought,
    };
  });
}
