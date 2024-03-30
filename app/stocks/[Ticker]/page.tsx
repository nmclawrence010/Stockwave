"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  fetchStockQuote,
  fetchStockProfile,
  fetchLogo,
} from "@/lib/StockAPIFunctionality";
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
      const { quoteData, profileData, logoURL } =
        await fetchAndCalculateStockData(params.Ticker);
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
              <Image
                src={stockData.logoURL}
                alt="logo"
                width={100}
                height={100}
              />
              <h2 className="text-title-xxl font-semibold text-black dark:text-white">
                {stockData.quoteData.name}
              </h2>
            </div>
            <p>
              {stockData.quoteData.exchange} {stockData.quoteData.currency}
            </p>
          </div>
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <h3 className="text-title-md font-semibold text-black dark:text-white">
              Details
            </h3>
            <p>
              {stockData.profileData?.sector} -{" "}
              {stockData.profileData?.industry}
            </p>
          </div>
          <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
            <h3 className="text-title-md font-semibold text-black dark:text-white">
              About
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "150px",
                marginTop: "20px",
              }}
            >
              <div>
                <h4 className="text-title-xsm font-semibold text-black dark:text-white">
                  CEO
                </h4>
                <p>{stockData.profileData?.CEO}</p>
              </div>
              <div>
                <h4 className="text-title-xsm font-semibold text-black dark:text-white">
                  Website
                </h4>
                <p>{stockData.profileData?.website}</p>
              </div>
            </div>

            <div
              style={{ alignItems: "center", gap: "20px", marginTop: "20px" }}
            >
              <h4 className="text-title-xsm font-semibold text-black dark:text-white">
                Address
              </h4>
              <p>
                {stockData.profileData?.address}, {stockData.profileData?.city}
              </p>
              <p>
                {stockData.profileData?.state}, {stockData.profileData?.country}
                , {stockData.profileData?.zip}
              </p>

              <p>{stockData.profileData?.phone}</p>
            </div>
            <div
              style={{ alignItems: "center", gap: "20px", marginTop: "20px" }}
            >
              <h4 className="text-title-xsm font-semibold text-black dark:text-white">
                Description
              </h4>
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
