"use client";

import { ApexOptions } from "apexcharts";
import { Props } from "react-apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { fetchSPX, fetchStockMonthly } from "@/lib/StockAPIFunctionality";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const SPXChart: React.FC<Props> = ({ aggregatedData }) => {
  const [chartData, setChartData] = useState<{ name: string; data: number[] }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSPX();
        const openValues = data.values.map((item: any) => parseFloat(item.open)).reverse();

        const totalMarketValue = aggregatedData.reduce((total: any, item: any) => total + item.MarketValue, 0);
        const tickerPercentages = aggregatedData.map((item: any) => ({
          Ticker: item.Ticker,
          Percentage: (item.MarketValue / totalMarketValue) * 100,
        }));

        //console.log("Ticker Percentages:", tickerPercentages);

        const allocation = calculateAllocation(tickerPercentages);

        const sharesAndPercentageDifferencesPromises = tickerPercentages.map(async (tickerPercentage: any) => {
          try {
            const tickerData = await fetchStockMonthly(tickerPercentage.Ticker);
            const percentageDifferences = calculatePercentageDifferences(tickerData.values, tickerPercentage.Ticker);

            // Calculate shares for the ticker
            const shares = calculateShares(
              tickerData.values[tickerData.values.length - 1],
              allocation[tickerPercentage.Ticker],
              tickerPercentage.Ticker,
            );

            return { ticker: tickerPercentage.Ticker, shares, percentageDifferences };
          } catch (error) {
            console.error(`Error fetching data for ${tickerPercentage.Ticker}:`, error);
            return null;
          }
        });

        const sharesAndPercentageDifferences = await Promise.all(sharesAndPercentageDifferencesPromises);

        const sharesAndInvestmentWorthPromises = sharesAndPercentageDifferences.map(async (item: any) => {
          const investmentWorthPerMonth = calculateInvestmentWorthPerMonth(
            item.shares.allocatedAmount,
            item.percentageDifferences.percentageDifferences,
          );
          return {
            ticker: item.ticker,
            investmentWorthPerMonth,
          };
        });

        const sharesAndInvestmentWorth = await Promise.all(sharesAndInvestmentWorthPromises);
        //console.log("Investment worth per month:", sharesAndInvestmentWorth);

        // Combining the separate monthly investment amounts into one
        const combinedMonthlyValues = combineMonthlyValues(sharesAndInvestmentWorth);
        //console.log("Combined:", combinedMonthlyValues);

        // Prep data into an array for the chart
        const chartData = prepareChartData(combinedMonthlyValues, openValues);

        // Log the investment worth data
        //console.log("Investment Worth Data:", chartData);
        //console.log("OpenValues:", openValues);

        setChartData([
          { name: "S&P500", data: openValues },
          {
            name: "Product Two",
            data: chartData,
          },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    //console.log("AGGREGATED DATA:", aggregatedData);
    fetchData();
  }, [aggregatedData]);

  const initialInvestment = 5000;

  // Function to calculate allocation based on ticker percentages
  const calculateAllocation = (tickerPercentages: any) => {
    const allocation: any = {};
    for (const tickerPercentage of tickerPercentages) {
      allocation[tickerPercentage.Ticker] = (tickerPercentage.Percentage / 100) * initialInvestment;
    }
    return allocation;
  };

  // Function to calculate shares for each ticker
  const calculateShares = (tickerData: any, allocatedAmount: number, ticker: string) => {
    const closePrice = parseFloat(tickerData.close);
    const numberOfShares = allocatedAmount / closePrice;
    // Return allocated amount instead of number of shares
    return { ticker, allocatedAmount };
  };

  // Function to calculate investment worth per month based on percentage differences
  const calculateInvestmentWorthPerMonth = (initialAmount: number, percentageDifferences: any) => {
    let currentAmount = initialAmount;
    const investmentWorthPerMonth: any = {};

    // Loop through each month's percentage difference
    for (const [month, percentDifference] of Object.entries(percentageDifferences)) {
      if (typeof percentDifference === "number") {
        // If the percentage difference is already a number, use it directly
        currentAmount *= 1 + percentDifference / 100;
        investmentWorthPerMonth[month] = currentAmount;
      } else if (typeof percentDifference === "string") {
        // Parse the percentage difference as a float if it's a string
        const parsedPercentDifference = parseFloat(percentDifference);
        if (!isNaN(parsedPercentDifference)) {
          currentAmount *= 1 + parsedPercentDifference / 100;
          investmentWorthPerMonth[month] = currentAmount;
        } else {
          console.error(`Invalid percentage difference value for ${month}: ${percentDifference}`);
        }
      } else {
        console.error(`Invalid percentage difference type for ${month}: ${typeof percentDifference}`);
      }
    }

    return investmentWorthPerMonth;
  };

  // Function to combine the investment worth per month across all stock tickers
  const combineMonthlyValues = (data: any) => {
    const combinedValues: any = {};

    // Loop through each stock ticker data
    for (const stock of data) {
      // Loop through each month's investment worth for the stock
      for (const [month, investmentWorth] of Object.entries(stock.investmentWorthPerMonth)) {
        // Add the investment worth to the combined values
        if (!combinedValues[month]) {
          combinedValues[month] = 0;
        }
        combinedValues[month] += investmentWorth;
      }
    }

    return combinedValues;
  };

  // Function to calculate percentage difference for each month
  const calculatePercentageDifferences = (tickerData: any[], tickerSymbol: string) => {
    const percentageDifferences: any = {};

    // Loop through each month's data (except the last one)
    for (let i = 0; i < tickerData.length - 1; i++) {
      const currentClose = parseFloat(tickerData[i].close);
      const previousClose = parseFloat(tickerData[i + 1].close);

      // Calculate percentage difference between current and previous close prices
      const percentDifference = ((currentClose - previousClose) / previousClose) * 100;

      // Store the percentage difference for the month along with the ticker symbol
      percentageDifferences[`Month${tickerData.length - i}`] = percentDifference;
    }

    return { ticker: tickerSymbol, percentageDifferences };
  };

  const prepareChartData = (combinedMonthlyValues: any, openValues: number[]) => {
    const initialInvestment = openValues[0];
    const chartData: number[] = [initialInvestment]; // Initialize the chart data array with the initial investment

    // Extract the numbers from combinedMonthlyValues and add them to the chart data array
    for (const month in combinedMonthlyValues) {
      const investmentWorth = combinedMonthlyValues[month];
      chartData.push(parseFloat(investmentWorth.toFixed(2))); // Round to 2 decimal places
    }

    return chartData;
  };

  //Combine the two so we can get the min value
  const sp500DataMin = chartData.find((item) => item.name === "S&P500")?.data ?? [];
  const productTwoDataMin = chartData.find((item) => item.name === "Product Two")?.data ?? [];
  const allData = [...sp500DataMin, ...productTwoDataMin];

  //Get the min and max value to set the x axis
  const maxChartValue = Math.max(...chartData.flatMap((series) => series.data));
  //const minChartValue = Math.min(...(chartData.find((item) => item.name === "S&P500")?.data ?? []));
  const minChartValue = Math.min(...allData);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Construct categories array starting from 11 months ago to the current month
  const categories = [];
  for (let i = currentMonth; i >= currentMonth - 11; i--) {
    const monthIndex = i < 0 ? 12 + i : i; // Handle negative indices (loop back around to previous year)
    categories.push(`${months[monthIndex]}`);
  }

  const productOneData = chartData.find((item) => item.name === "S&P500")?.data;
  const productTwoData = chartData.find((item) => item.name === "Product Two")?.data;

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#FFA70B"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      dropShadow: {
        enabled: true,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 1,
      },
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "straight",
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#3056D3", "#FFA70B"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 0,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: categories.reverse(), // Reverse the array to display in chronological order

      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: minChartValue,
      max: maxChartValue, // Set the maximum value for the y-axis
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
          <div className="flex w-full flex-wrap gap-3 sm:gap-5">
            <div className="flex min-w-47.5">
              <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
              </span>
              <div className="w-full group relative inline-block">
                <p className="font-semibold text-primary text-xl">S&P 500</p>
                <p className="text-sm font-medium">Last 12 months</p>
                <div className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded bg-black px-4.5 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                  <p className="text-md font-medium">SPX on the close of each month</p>
                </div>
              </div>
            </div>
            <div className="flex min-w-47.5">
              <span
                className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border"
                style={{ borderColor: "#FFA70B" }}
              >
                <span className="block h-2.5 w-full max-w-2.5 rounded-full" style={{ backgroundColor: "#FFA70B" }}></span>
              </span>
              <div className="w-full group relative inline-block">
                <p className="font-semibold text-xl" style={{ color: "#FFA70B" }}>
                  Current Holdings
                </p>
                <p className="text-sm font-medium">Last 12 months</p>
                <div className="absolute bottom-full left-1/2 z-20 mb-3 -translate-x-1/2 whitespace-nowrap rounded bg-black px-4.5 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100">
                  <p className="text-md font-medium">
                    How the current make up of your portfolio would have <br />
                    performed vs SPX if the same amount was invested <br />
                    12 months ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="spxchart" className="-ml-5 h-[355px] w-[105%]">
          <ReactApexChart
            options={options}
            series={[
              { name: "S&P500", data: productOneData ?? [] },
              { name: "You", data: productTwoData ?? [] },
            ]}
            type="area"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
};

export default SPXChart;
