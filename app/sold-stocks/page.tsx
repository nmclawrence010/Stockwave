import { useEffect, useState } from "react";

import SellsTable from "@/components/Tables/SellsTable";
import CardDataStats from "@/components/CardDataStats";

import { getDatabaseItemsSell } from "@/lib/AWSFunctionality";

import { STOCKSELL } from "@/types/stockSell";
import { PORTFOLIORECORDSELL } from "@/types/userPortfolioSell";

async function fetchAndCalculateSoldStocks() {
  const dbDataSells: STOCKSELL[] = [];

  await getDatabaseItemsSell(dbDataSells);
  const promisesSell = dbDataSells.map(async (element) => {
    return {
      Ticker: element.Ticker,
      NoShares: element.NoShares,
      AverageCost: element.AverageCost,
      AverageSellPrice: element.AverageSellPrice,
      DateBought: element.DateBought,
      LogoURL: element.LogoURL,
      TotalPaid: element.AverageSellPrice * element.NoShares,
      GainLoss: element.AverageSellPrice * element.NoShares - element.AverageCost * element.NoShares,
      TransactionID: element.TransactionID,
    };
  });

  const resultsSells = await Promise.all(promisesSell);

  //Doing the overall and percentage gains for sold stocks
  const realisedTotal = resultsSells.reduce((sum, result) => sum + result.GainLoss, 0);
  const realisedTotalPaid = resultsSells.reduce((sum, result) => sum + result.TotalPaid, 0);
  const realisedPercentage = (realisedTotal / realisedTotalPaid) * 100;

  //Aggregating transactions to show under a single stock in the table
  const aggregatedDataSells = resultsSells.reduce((result: Array<PORTFOLIORECORDSELL>, currentItem) => {
    const existingItemSell = result.find((item) => item.Ticker === currentItem.Ticker);

    if (existingItemSell) {
      existingItemSell.NoShares += currentItem.NoShares;
      existingItemSell.TotalPaid += currentItem.TotalPaid;
      existingItemSell.AverageSellPrice += currentItem.AverageSellPrice;
      existingItemSell.GainLoss += currentItem.GainLoss;
      existingItemSell.AverageCost = existingItemSell.TotalPaid / existingItemSell.NoShares;
    } else {
      result.push({ ...currentItem });
    }

    return result;
  }, []);

  return {
    resultsSells,
    aggregatedDataSells,
    realisedTotal,
    realisedPercentage,
  };
}

function soldStocksPage() {
  const [tableDataSells, setTableDataSells] = useState<PORTFOLIORECORDSELL[]>([]);
  const [additionalTableDataSells, setAdditionalTableDataSells] = useState<PORTFOLIORECORDSELL[]>([]);
  const [realisedGainLoss, setRealisedGainLoss] = useState<number>(0);
  const [realisedPercentageGain, setRealisedGainLossPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { resultsSells, realisedTotal, realisedPercentage, aggregatedDataSells } = await fetchAndCalculateSoldStocks();
      setTableDataSells(aggregatedDataSells);
      setAdditionalTableDataSells(resultsSells);
      setRealisedGainLoss(realisedTotal);
      setRealisedGainLossPercentage(realisedPercentage);
    };

    fetchInitialData();
  }, []);

  //For rerendering the component when new stuff is added
  const refreshDataSells = async () => {
    const newData = await fetchAndCalculateSoldStocks();
    const { resultsSells, aggregatedDataSells } = newData;
    setTableDataSells(aggregatedDataSells);
    setAdditionalTableDataSells(resultsSells);
  };

  useEffect(() => {
    refreshDataSells();
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <CardDataStats
          title="Realised Gain"
          total={`${realisedGainLoss.toFixed(2)}`}
          rate={`${realisedPercentageGain.toFixed(2)}%`}
          tooltipText="Unrealised gain includes dividends <br /> but the percentage does not"
        >
          <svg
            className="fill-white dark:fill-white w-8 2xl:w-10 h-[34px]"
            viewBox="0 0 640 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M535 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l64 64c4.5 4.5 7 10.6 7 17s-2.5 12.5-7 17l-64 64c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l23-23L384 112c-13.3 0-24-10.7-24-24s10.7-24 24-24l174.1 0L535 41zM105 377l-23 23L256 400c13.3 0 24 10.7 24 24s-10.7 24-24 24L81.9 448l23 23c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 441c-4.5-4.5-7-10.6-7-17s2.5-12.5 7-17l64-64c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM96 64H337.9c-3.7 7.2-5.9 15.3-5.9 24c0 28.7 23.3 52 52 52l117.4 0c-4 17 .6 35.5 13.8 48.8c20.3 20.3 53.2 20.3 73.5 0L608 169.5V384c0 35.3-28.7 64-64 64H302.1c3.7-7.2 5.9-15.3 5.9-24c0-28.7-23.3-52-52-52l-117.4 0c4-17-.6-35.5-13.8-48.8c-20.3-20.3-53.2-20.3-73.5 0L32 342.5V128c0-35.3 28.7-64 64-64zm64 64H96v64c35.3 0 64-28.7 64-64zM544 320c-35.3 0-64 28.7-64 64h64V320zM320 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z" />
          </svg>
        </CardDataStats>
      </div>
      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-12">
          <SellsTable
            tableData={tableDataSells}
            additionalTableData={additionalTableDataSells}
            onSubmitSuccess={refreshDataSells}
            onDeleteSuccess={refreshDataSells}
          />
        </div>
      </div>
    </>
  );
}

export default soldStocksPage;
