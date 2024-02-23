import { fetchStockData, fetchLogo } from "./StockAPIFunctionality";
import { getDatabaseItems } from "./AWSFunctionality";
import { STOCK } from "@/types/stocks";

const dbData: STOCK[] = [];
var myArr: any[] = [];
export async function stockDataOnload() {
  const data = await getDatabaseItems(dbData);

  console.log("DBDATA", data);
  //console.log("DBDATA", dbData[0]);
  //console.log("DBDATA", dbData.at(0));
  //dbData.map((brand, key) => (console.log(brand.Ticker));
  //console.log("STRING123", abc);

  // dbData.forEach((element, index, array) => {
  //   myArr.push(array);
  // });
  //console.log(myArr, "MYARRAY");

  // const googleShares = dbData[0].Ticker;
  // console.log(googleShares);

  // const msftData = dbData.find((stock) => stock.Ticker === "MSFT");
  // if (msftData) {
  //   console.log("MSFT Market Value:", msftData.MarketValue);
  // }

  //const googleStock = dbData[0];
  //const googlTicker = googleStock.Ticker;
  //const googlShares = googleStock.NoShares;
  //console.log("OVERHERE", googleStock);

  // const extractedData = dbData.map((stock) => ({
  //   ticker: stock.Ticker,
  //   shares: stock.NoShares,
  //   averageCost: stock.AverageCost,
  //   marketValue: stock.MarketValue,
  // }));
  // console.log(dbData);
}
