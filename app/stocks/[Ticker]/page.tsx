"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { fetchStockQuote, fetchStockProfile, fetchLogo } from "@/lib/StockAPIFunctionality";
import { QUOTE } from "@/types/dynamicPageQuote";
import { PROFILE } from "@/types/dynamicPageProfile";

async function fetchAndCalculateStockData(quoteTicker: string) {
  const quoteData = await fetchStockQuote(quoteTicker);
  const profileData = await fetchStockProfile(quoteTicker);
  const logoURL = await fetchLogo(quoteTicker);

  return { quoteData, profileData, logoURL };
}

function StockPage({ params }: { params: { Ticker: string } }) {
  const [stockData, setStockData] = useState<{
    quoteData: QUOTE | null;
    profileData: PROFILE | null;
    logoURL: string;
  }>({ quoteData: null, profileData: null, logoURL: "logo" });

  useEffect(() => {
    const getStockData = async () => {
      const { quoteData, profileData, logoURL } = await fetchAndCalculateStockData(params.Ticker);
      setStockData({ quoteData, profileData, logoURL });
    };

    getStockData();
  }, [params.Ticker]);

  return (
    <>
      {stockData.quoteData ? (
        <div>
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <Image src={stockData.logoURL} alt="logo" width={100} height={100} />
              <div>
                <h2 className="text-title-xxl font-semibold text-black dark:text-white">
                  {stockData.quoteData.name}&nbsp;({stockData.quoteData.symbol}) &nbsp;$({stockData.quoteData.close}) &nbsp;
                  <span className={stockData.quoteData.change < 0 ? "text-meta-1" : "text-meta-3"}>
                    +{Number(stockData.quoteData.change).toFixed(2)}
                  </span>
                  &nbsp;&nbsp;&nbsp;
                  <span className={stockData.quoteData.percent_change < 0 ? "text-meta-1" : "text-meta-3"}>
                    {Number(stockData.quoteData.percent_change).toFixed(2)}%
                  </span>
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <h2 className="text-title-xxl font-semibold text-black dark:text-white"></h2>
                </div>
                <p>
                  {stockData.quoteData.exchange} - Price as of {stockData.quoteData.datetime} -&nbsp;
                  {stockData.quoteData.timestamp}
                </p>
              </div>
            </div>
          </div>
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <h3 className="text-title-md font-semibold text-black dark:text-white">Details</h3>
            <table style={{ borderCollapse: "collapse" }}>
              <tr>
                <td style={{ paddingBottom: "10px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">Sector/Industry</h4>
                  <p>
                    {stockData.profileData?.sector} - {stockData.profileData?.industry}
                  </p>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: "10px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">Previous Close</h4>
                  <p>${Number(stockData.quoteData?.previous_close).toFixed(2)}</p>
                </td>
                <td style={{ paddingBottom: "10px", paddingLeft: "20px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">Open</h4>
                  <p>${Number(stockData.quoteData?.open).toFixed(2)}</p>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: "10px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">Volume</h4>
                  <p>{stockData.quoteData?.volume}</p>
                </td>
                <td style={{ paddingBottom: "10px", paddingLeft: "20px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">Average Volume</h4>
                  <p>{stockData.quoteData?.average_volume}</p>
                </td>
              </tr>
              <tr>
                <td style={{ paddingBottom: "10px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">52 Week High</h4>
                  <p>${Number(stockData.quoteData?.fifty_two_week?.high).toFixed(2)}</p>
                </td>
                <td style={{ paddingBottom: "20px", paddingLeft: "20px" }}>
                  <h4 className="text-title-xsm font-semibold text-black dark:text-white">52 Week Low</h4>
                  <p>${Number(stockData.quoteData?.fifty_two_week?.low).toFixed(2)}</p>
                </td>
              </tr>
            </table>
          </div>
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <h3 className="text-title-md font-semibold text-black dark:text-white">About</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "150px",
              }}
            >
              <div>
                <h4 className="text-title-xsm font-semibold text-black dark:text-white">CEO</h4>
                <p>{stockData.profileData?.CEO}</p>
              </div>
              <div>
                <h4 className="text-title-xsm font-semibold text-black dark:text-white">Website</h4>
                <p>{stockData.profileData?.website}</p>
              </div>
            </div>

            <div style={{ alignItems: "center", gap: "20px", marginTop: "20px" }}>
              <h4 className="text-title-xsm font-semibold text-black dark:text-white">Address</h4>
              <p>
                {stockData.profileData?.address}, {stockData.profileData?.city}
              </p>
              <p>
                {stockData.profileData?.state}, {stockData.profileData?.country}, {stockData.profileData?.zip}
              </p>

              <p>{stockData.profileData?.phone}</p>
            </div>
            <div style={{ alignItems: "center", gap: "20px", marginTop: "20px" }}>
              <h4 className="text-title-xsm font-semibold text-black dark:text-white">Description</h4>
              <p>{stockData.profileData?.description}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default StockPage;
