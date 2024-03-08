"use client";
import React, { useState, useEffect } from "react";
import CardDataStats from "../components/CardDataStats";
import ChartOne from "../components/Charts/ChartOne";
import ChartThree from "../components/Charts/ChartThree";
import TableOne from "../components/Tables/TableOne";
import { stockDataOnload } from "@/lib/StockOnload";
import { PORTFOLIORECORD } from "@/types/userPortfolio";
import { getCurrentUser } from "@/lib/Auth0Functionality";
import { fetchLogo, fetchStockData } from "@/lib/StockAPIFunctionality";
import { STOCK } from "@/types/stocks";
import { STOCKSELL } from "@/types/stockSell";
import { getDatabaseItems, getDatabaseItemsSell } from "@/lib/AWSFunctionality";
import { PORTFOLIORECORDSELL } from "@/types/userPortfolioSell";
import TableTwo from "@/components/Tables/TableTwo";

async function fetchAndCalculateStockData() {
  const dbData: STOCK[] = [];
  const dbDataSells: STOCKSELL[] = [];

  //For the buy table
  await getDatabaseItems(dbData);
  const promises = dbData.map(async (element) => {
    // Create an array of promises for fetchStockData and fetchLogo
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

  const results = await Promise.all(promises); // Wait for all promises to resolve

  //console.log("PROMISES LENGTH", promises.length);

  //For the sell table
  await getDatabaseItemsSell(dbDataSells);
  const promisesSell = dbDataSells.map(async (element) => {
    // Create an array of promises for fetchStockData and fetchLogo
    const logoURL = await fetchLogo(element.Ticker);

    return {
      Ticker: element.Ticker,
      NoShares: element.NoShares,
      AverageCost: element.AverageCost,
      AverageSellPrice: element.AverageSellPrice,
      DateBought: element.DateBought,
      LogoURL: logoURL,
      TotalPaid: element.AverageCost * element.NoShares,
      GainLoss:
        element.AverageSellPrice * element.NoShares -
        element.AverageCost * element.NoShares,
      TransactionID: element.TransactionID,
    };
  });

  const resultsSells = await Promise.all(promisesSell); // Wait for all promises to resolve

  //Card Calculations
  // Unrealised (Summing the Gain/Loss from each transaction in the Current Holdings)
  const unrealisedGainLoss = results.reduce(
    (sum, result) => sum + result.GainLoss,
    0,
  );

  // Realised (Summing the Gain/Loss from each transaction in the Sell Table)
  const realisedGainLoss = resultsSells.reduce(
    (sum, result) => sum + result.GainLoss,
    0,
  );

  const overallGainLoss = unrealisedGainLoss + realisedGainLoss; // Overall gain

  // Summing the total spend for the current holdings so we can work out the percentage gain/loss
  const totalTotalPaid = results.reduce(
    (sum, result) => sum + result.TotalPaid,
    0,
  );

  // Summing the total spend for the current holdings so we can work out the percentage gain/loss
  const totalTotalPaidSells = resultsSells.reduce(
    (sum, result) => sum + result.TotalPaid,
    0,
  );

  //Percentage calcs for the overall portfolio
  const unrealisedPercentageGain = (unrealisedGainLoss / totalTotalPaid) * 100; // Unrealised gain %
  const realisedPercentageGain = (realisedGainLoss / totalTotalPaidSells) * 100; // Realised gain %
  const overallGainLossPercentage =
    ((unrealisedGainLoss + realisedGainLoss) /
      (totalTotalPaid + totalTotalPaidSells)) *
    100; // Overall gain %

  //Aggregating rows from results to display different transactions on the same stock together to show your overall position
  //Aggregated current holdings
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
        existingItem.GainLoss += currentItem.GainLoss;
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
  //Aggregated Sells
  const aggregatedDataSells = resultsSells.reduce(
    (result: Array<PORTFOLIORECORDSELL>, currentItem) => {
      const existingItemSell = result.find(
        (item) => item.Ticker === currentItem.Ticker,
      );

      if (existingItemSell) {
        // If a matching Ticker is found, update the values
        existingItemSell.NoShares += currentItem.NoShares;
        existingItemSell.TotalPaid += currentItem.TotalPaid;
        existingItemSell.AverageSellPrice += currentItem.AverageSellPrice;
        existingItemSell.GainLoss += currentItem.GainLoss;
        existingItemSell.AverageCost =
          existingItemSell.TotalPaid / existingItemSell.NoShares;
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
    resultsSells, // The two results are the ungrouped transactions
    unrealisedGainLoss,
    unrealisedPercentageGain,
    realisedGainLoss,
    realisedPercentageGain,
    overallGainLoss,
    overallGainLossPercentage,
    aggregatedData, // The aggreagated data is the transactions grouped together by their matching stock ticker
    aggregatedDataSells,
    chartThreeData,
  };
}

function Home() {
  //Data for users transactions
  const [tableData, setTableData] = useState<PORTFOLIORECORD[]>([]);
  const [tableDataSells, setTableDataSells] = useState<PORTFOLIORECORDSELL[]>(
    [],
  );
  //FOr the sub table
  const [additionalTableData, setAdditionalTableData] = useState<
    PORTFOLIORECORD[]
  >([]);
  const [additionalTableDataSells, setAdditionalTableDataSells] = useState<
    PORTFOLIORECORDSELL[]
  >([]);
  //Data for the Cards
  const [unrealisedGainLoss, setUnrealisedGainLoss] = useState<number>(0);
  const [unrealisedPercentageGain, setUnrealisedGainLossPercentage] =
    useState<number>(0);
  const [realisedGainLoss, setRealisedGainLoss] = useState<number>(0);
  const [realisedPercentageGain, setRealisedGainLossPercentage] =
    useState<number>(0);
  const [overallGainLoss, setOverallGainLoss] = useState<number>(0);
  const [overallPercentageGain, setOverallGainLossPercentage] =
    useState<number>(0);
  //Data for the Donut chart
  const [donutData, setDonutData] = useState<PORTFOLIORECORD[]>([]);
  const [donutDataLabels, setDonutDataLabels] = useState([]);

  //Setting the current user into session storage for later use
  sessionStorage.setItem("currentUser", getCurrentUser());

  useEffect(() => {
    const getServerSideProps = async () => {
      const {
        results,
        resultsSells,
        unrealisedGainLoss,
        unrealisedPercentageGain,
        realisedGainLoss,
        realisedPercentageGain,
        overallGainLoss,
        overallGainLossPercentage,
        aggregatedData,
        aggregatedDataSells,
        chartThreeData,
      } = await fetchAndCalculateStockData();
      //For table and sub table
      setTableData(aggregatedData);
      setTableDataSells(aggregatedDataSells);
      setAdditionalTableData(results);
      setAdditionalTableDataSells(resultsSells);
      /////////////////////////
      setUnrealisedGainLoss(unrealisedGainLoss);
      setUnrealisedGainLossPercentage(unrealisedPercentageGain);
      setRealisedGainLoss(realisedGainLoss);
      setRealisedGainLossPercentage(realisedPercentageGain);
      setOverallGainLoss(overallGainLoss);
      setOverallGainLossPercentage(overallGainLossPercentage);

      // Pass data to ChartThree
      setDonutData(aggregatedData);
      setDonutDataLabels(chartThreeData.labels as never[]);
    };

    getServerSideProps();
  }, []);

  return (
    <>
      <React.StrictMode>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
          <CardDataStats
            title="Total Gain"
            total={`$${overallGainLoss.toFixed(2)}`}
            rate={`${overallPercentageGain.toFixed(2)}%`}
            levelUp
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="fill-primary dark:fill-white"
              width="28"
              height="22"
              viewBox="0 0 576 512"
              fill="none"
            >
              <path d="M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32H544c17.7 0 32 14.3 32 32V288c0 17.7-14.3 32-32 32s-32-14.3-32-32V205.3L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160H384z" />
            </svg>
          </CardDataStats>
          <CardDataStats
            title="Unrealised Gain"
            total={`$${unrealisedGainLoss.toFixed(2)}`}
            rate={`${unrealisedPercentageGain.toFixed(2)}%`}
            levelUp
          >
            <svg
              className="fill-primary dark:fill-white"
              width="28"
              height="22"
              viewBox="0 0 576 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm64 320H64V320c35.3 0 64 28.7 64 64zM64 192V128h64c0 35.3-28.7 64-64 64zM448 384c0-35.3 28.7-64 64-64v64H448zm64-192c-35.3 0-64-28.7-64-64h64v64zM288 160a96 96 0 1 1 0 192 96 96 0 1 1 0-192z" />
            </svg>
          </CardDataStats>
          <CardDataStats
            title="Realised Gain"
            total={`$${realisedGainLoss.toFixed(2)}`}
            rate={`${realisedPercentageGain.toFixed(2)}%`}
            levelUp
          >
            <svg
              className="fill-primary dark:fill-white"
              width="28"
              height="22"
              viewBox="0 0 576 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M535 41c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l64 64c4.5 4.5 7 10.6 7 17s-2.5 12.5-7 17l-64 64c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l23-23L384 112c-13.3 0-24-10.7-24-24s10.7-24 24-24l174.1 0L535 41zM105 377l-23 23L256 400c13.3 0 24 10.7 24 24s-10.7 24-24 24L81.9 448l23 23c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L7 441c-4.5-4.5-7-10.6-7-17s2.5-12.5 7-17l64-64c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9zM96 64H337.9c-3.7 7.2-5.9 15.3-5.9 24c0 28.7 23.3 52 52 52l117.4 0c-4 17 .6 35.5 13.8 48.8c20.3 20.3 53.2 20.3 73.5 0L608 169.5V384c0 35.3-28.7 64-64 64H302.1c3.7-7.2 5.9-15.3 5.9-24c0-28.7-23.3-52-52-52l-117.4 0c4-17-.6-35.5-13.8-48.8c-20.3-20.3-53.2-20.3-73.5 0L32 342.5V128c0-35.3 28.7-64 64-64zm64 64H96v64c35.3 0 64-28.7 64-64zM544 320c-35.3 0-64 28.7-64 64h64V320zM320 352a96 96 0 1 0 0-192 96 96 0 1 0 0 192z" />
            </svg>
          </CardDataStats>
        </div>

        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <ChartOne />
          <ChartThree
            donutData={{
              labels: donutDataLabels,
              series: donutData.map((item) => item.MarketValue),
            }}
          />
          <div className="col-span-12 xl:col-span-12">
            <TableOne
              tableData={tableData}
              additionalTableData={additionalTableData}
              unrealisedGainLoss={unrealisedGainLoss}
            />
          </div>
          <div className="col-span-12 xl:col-span-12">
            <TableTwo
              tableData={tableDataSells}
              additionalTableData={additionalTableDataSells}
              unrealisedGainLoss={unrealisedGainLoss}
            />
          </div>
        </div>
      </React.StrictMode>
    </>
  );
}

export default Home;
