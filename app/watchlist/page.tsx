"use client";

import { useEffect, useState } from "react";

import { getDatabaseItemsWatchlist } from "@/lib/AWSFunctionality";

import { STOCKWATCHLIST } from "@/types/stockWatchlist";

async function fetchAndCalculateWatchlist() {
  const dbDataWatchlist: STOCKWATCHLIST[] = [];

  await getDatabaseItemsWatchlist(dbDataWatchlist);
  const promisesWatchlist = dbDataWatchlist.map(async (element) => {
    return {
      Ticker: element.Ticker,
      TargetPrice: element.TargetPrice,
      StockNotes: element.StockNotes,
      DateAdded: element.DateAdded,
      LogoURL: element.LogoURL,
      TransactionID: element.TransactionID,
    };
  });

  const resultsWatchlist = await Promise.all(promisesWatchlist);

  return {
    resultsWatchlist,
  };
}

function WatchlistPage() {
  const [watchlistData, setWatchlistData] = useState<STOCKWATCHLIST[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { resultsWatchlist } = await fetchAndCalculateWatchlist();
      setWatchlistData(resultsWatchlist);
    };
    fetchInitialData();
  }, []);

  return <></>;
}
