"use client";

import { useState, useEffect } from "react";
import {
  fetchStockQuote,
  fetchStockProfile,
} from "@/lib/StockAPIFunctionality";
import { QUOTE } from "@/types/dynamicPageQuote";
import { PROFILE } from "@/types/dynamicPageProfile";

async function fetchAndCalculateStockData(quoteTicker: string) {
  const quoteData = await fetchStockQuote(quoteTicker);
  const profileData = await fetchStockProfile(quoteTicker);

  return { quoteData, profileData };
}

function StockPage({ params }: { params: { Ticker: string } }) {
  const [stockData, setStockData] = useState<{
    quoteData: QUOTE | null;
    profileData: PROFILE | null;
  }>({ quoteData: null, profileData: null });

  useEffect(() => {
    const getStockData = async () => {
      const { quoteData, profileData } = await fetchAndCalculateStockData(
        params.Ticker,
      );
      setStockData({ quoteData, profileData });
    };

    getStockData();
  }, [params.Ticker]);

  return (
    <>
      {stockData.quoteData ? (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {stockData.quoteData.name}
          </h2>
          <p>
            {stockData.quoteData.exchange} {stockData.quoteData.currency}
          </p>
          <p>{stockData.profileData?.description}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default StockPage;
