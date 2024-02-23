import { STOCK } from "@/types/stocks";
import Image from "next/image";
import { getDatabaseItems } from "@/lib/AWSFunctionality";
import { fetchLogo, fetchStockData } from "@/lib/StockAPIFunctionality";
import { useEffect, useState } from "react";

const dbData: STOCK[] = [];

interface StockData {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

let logoURL: string;

getDatabaseItems(dbData);

function getCurrentStockPrice(ticker: string) {
  const [metaData, setMetaData] = useState(null);
  const [stockData, setStockData] = useState<StockData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stocks = await fetchStockData(ticker);
        //const logos = await fetchLogo(ticker);
        setMetaData(stocks.meta);
        setStockData(stocks.values);
        //setLogoData(logos.url);
        console.log("Successful Call!");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  return (
    <div className="p-5">
      {stockData.map((stock, index) => (
        <div className="flex items-center justify-center p-2.5 xl:p-5">
          <p className="text-black dark:text-white">{stock.close}</p>
        </div>
      ))}
    </div>
  );
}

function getStockLogo(ticker: string) {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const logos = await fetchLogo(ticker);
        logoURL = logos.url;
        console.log(logos.url);
        console.log("Successful Call!");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  });
  return (
    <div className="p-5">
      <div className="flex-shrink-0">
        <Image src={logoURL} alt="Brand" width={48} height={48} />
      </div>
    </div>
  );
}

let TableOne = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        My Portfolio
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Stock
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              No. of Shares
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Average Cost
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Market Value
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Current Price
            </h5>
          </div>
        </div>

        {dbData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === dbData.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              {getStockLogo(brand.Ticker)}
              <p className="hidden text-black dark:text-white sm:block">
                {brand.Ticker}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.NoShares}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.AverageCost}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.MarketValue}</p>
            </div>

            {getCurrentStockPrice(brand.Ticker)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
