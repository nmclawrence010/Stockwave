"use client";

import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import { Props } from "react-apexcharts";
import dynamic from "next/dynamic";

import { fetchStock52Weekly, fetchSPX52Weekly } from "@/lib/StockAPIFunctionality";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface PortfolioPerformanceChartState {
  series: {
    name: string;
    data: number[][];
  }[];
  adjustedValues?: number[];
}

const PortfolioPerformanceChart: React.FC<Props> = ({
  unAggregatedData,
  aggregatedData,
  unrealisedTotal,
  unrealisedPercentage,
  unrealisedMarketValue,
}) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Calculate the total value of the portfolio
        const totalMarketValue = unAggregatedData.reduce((total: any, item: any) => total + item.MarketValue, 0);

        // Then work out what percentage of the portfolio each stock makes up
        const transactionPercentages = unAggregatedData.map((item: any) => ({
          Ticker: item.Ticker,
          Percentage: (item.MarketValue / totalMarketValue) * 100, // Calculate percentage based on filtered transactions
          DateBought: item.DateBought,
        }));

        const aggregatedCloseValues = [];
        const aggregatedCloseValuesSPX = [];

        for (const transaction of transactionPercentages) {
          const stockData = await fetchStock52Weekly(transaction.Ticker);
          if (stockData.length > 0) {
            const purchaseDate = new Date(transaction.DateBought);
            const filteredStockData = stockData.filter(
              (week: { datetime: string | number | Date }) => new Date(week.datetime) >= purchaseDate,
            );
            const closeValues = filteredStockData.map((week: any) => parseFloat(week.close));
            // Calculate differences in reverse order
            const differences = closeValues
              .slice()
              .reverse()
              .map((value: any, index: any, array: any) => {
                if (index === array.length - 1) return 0; // If it's the last value, return 0
                const nextValue = array[index + 1];
                const percentageDifference = ((nextValue - value) / value) * 100;
                return percentageDifference;
              });

            // Pad the differences array with zeros to ensure it has a length of 52
            const paddedDifferences = [...differences, ...Array(52 - differences.length).fill(0)];
            aggregatedCloseValues.push(paddedDifferences);
          }
        }

        //Same for SPX
        // Getting the close values of SPX
        const spxData = await fetchSPX52Weekly();
        const closeValuesSPX = spxData.map((week: any) => parseFloat(week.close));

        // Calculate differences in reverse order for SPX
        const differencesSPX = closeValuesSPX
          .slice()
          .reverse()
          .map((value: any, index: any, array: any) => {
            if (index === array.length - 1) return 0; // If it's the last value, return 0
            const nextValue = array[index + 1];
            const percentageDifference = ((nextValue - value) / value) * 100;
            return percentageDifference;
          });

        // Pad the differences array with zeros to ensure it has a length of 52
        const paddedDifferencesSPX = [...differencesSPX, ...Array(52 - differencesSPX.length).fill(0)];
        aggregatedCloseValuesSPX.push(paddedDifferencesSPX);

        // console.log("Close values:", aggregatedCloseValues);
        // console.log("Close values SPX:", aggregatedCloseValuesSPX);

        // Calculate weighted sum of percentage differences for each week
        const weightedSums = Array(52).fill(0); // Initialize array for weighted sums and fill with 52 0s

        // Iterate over each transaction and add weighted percentage differences to the sum
        for (let i = 0; i < aggregatedCloseValues.length; i++) {
          const transaction = transactionPercentages[i];
          const percentage = transaction.Percentage / 100; // Convert percentage to decimal
          for (let j = 0; j < 52; j++) {
            weightedSums[j] += aggregatedCloseValues[i][j] * percentage;
          }
        }

        weightedSums.reverse();

        // Calculate percentage change from the last updated value
        const calculatePercentageChange = (value: number, percentageChange: number): number => {
          return value + (value * percentageChange) / 100;
        };

        // Create a new array to store the values after applying percentage changes
        const updatedValues: number[] = [];

        // Start with an initial value of 100
        let currentValue = 100;

        // Iterate over each value in the weighted sums
        for (const value of weightedSums) {
          // Calculate percentage change from the last updated value
          currentValue = calculatePercentageChange(currentValue, value);

          // Store the updated value
          updatedValues.push(currentValue);
        }

        // Adjust updatedValues to represent percentage change from 100
        const adjustedValues = updatedValues.map((value) => Number((Number(value) - 100).toFixed(2)));
        //console.log("adjustedValues:", adjustedValues);

        // Calculate percentage differences for SPX
        const differencesSPX2 = aggregatedCloseValuesSPX[0];
        differencesSPX2.reverse();
        // Initialize the updatedValuesSPX with 100
        const updatedValuesSPX: number[] = [100];

        // Iterate over each value in the differencesSPX
        for (const value of differencesSPX2) {
          // Calculate percentage change from the last updated value
          const lastValue = updatedValuesSPX[updatedValuesSPX.length - 1];
          const updatedValue = calculatePercentageChange(lastValue, value);

          // Store the updated value
          updatedValuesSPX.push(updatedValue);
        }

        // Adjust updatedValuesSPX to represent percentage change from 100
        const adjustedValuesSPX = updatedValuesSPX.slice(1).map((value) => Number((Number(value) - 100).toFixed(2)));

        // Update the state with the weighted sums
        updateState(adjustedValues.reverse(), adjustedValuesSPX);
      } catch (error) {
        console.error("Error fetching and processing data:", error);
      }
    };

    fetchData();
  }, [aggregatedData]);

  const [state, setState] = useState<PortfolioPerformanceChartState>({
    series: [
      { name: "You", data: [] },
      { name: "SPX", data: [] },
    ],
  });

  // Adding the timestamps in with the data points for the labels
  const updateState = async (weightedSums: number[], adjustedValuesSPX: number[]) => {
    const currentDate = new Date();
    let currentDayOfWeek = currentDate.getDay();
    const data = weightedSums.map((value, index) => {
      const daysToSubtract = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      const startDate = new Date(currentDate.getTime() - (daysToSubtract + index * 7) * 24 * 60 * 60 * 1000);
      const timestamp = startDate.getTime();
      currentDayOfWeek = (currentDayOfWeek + 6) % 7;
      return [timestamp, value];
    });
    const reversedData = data.reverse();

    const spxData = adjustedValuesSPX.map((value, index) => {
      const timestamp = reversedData[index][0]; // Use the same timestamps as the first series
      return [timestamp, value];
    });

    setState((prevState) => ({
      ...prevState,
      series: [
        { ...prevState.series[0], name: "You", data: reversedData },
        { ...prevState.series[1], name: "SPX", data: spxData },
      ],
    }));
  };

  const options: ApexOptions = {
    colors: ["#fdca05", "#3C50E0"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 310,
      id: "area-datetime",
      type: "area",
      toolbar: {
        show: true,
      },
    },
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    stroke: {
      curve: "straight",
      width: [1, 1],
    },

    dataLabels: {
      enabled: false,
    },

    markers: {
      size: 0,
    },

    annotations: {},

    xaxis: {
      type: "category",
      tickAmount: 12,
      tickPlacement: "on",
      labels: {
        formatter: function (value) {
          // Convert the value to a Date object
          const date = new Date(value);

          // Get the month abbreviation (e.g., "Jan", "Feb", etc.)
          const monthAbbreviation = date.toLocaleString("default", { month: "short" });

          // Get the day of the month
          const dayOfMonth = date.getDate();

          // Concatenate the month abbreviation and day of the month
          return `${monthAbbreviation} ${dayOfMonth}`;
        },
      },

      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
      tooltip: {
        enabled: false,
      },
    },

    tooltip: {
      enabled: true,
      onDatasetHover: {
        highlightDataSeries: true,
      },
    },

    fill: {
      gradient: {
        enabled: true,
        opacityFrom: 0.55,
        opacityTo: 0,
      } as any,
    },

    grid: {
      strokeDashArray: 7,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
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
            height: 320,
          },
        },
      },
    ],
  };

  return (
    <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-black dark:bg-black sm:px-7.5 xl:col-span-8">
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-title-sm2 font-bold text-black dark:text-white">Annual Returns</h4>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-6">
        <div>
          <p className="mb-1.5 text-sm font-medium">Invested Value</p>
          <div className="flex items-center gap-2.5">
            <p className="font-medium text-black dark:text-white">${unrealisedMarketValue.toFixed(2)}</p>
            <p className="flex items-center gap-1 font-medium text-meta-3">
              {unrealisedPercentage.toFixed(2)}%
              <svg className="fill-current" width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.77105 0.0465078L10.7749 7.54651L0.767256 7.54651L5.77105 0.0465078Z" fill="" />
              </svg>
            </p>
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium">Unrealised Returns</p>
          <div className="flex items-center gap-2.5">
            <p className="font-medium text-black dark:text-white">${unrealisedTotal.toFixed(2)}</p>
            <p className="flex items-center gap-1 font-medium text-meta-3">
              {state.series.length > 0 && state.series[0].data.length > 0 && (
                <>{state.series[0].data[state.series[0].data.length - 1][1]}%</>
              )}
              <svg className="fill-current" width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.77105 0.0465078L10.7749 7.54651L0.767256 7.54651L5.77105 0.0465078Z" fill="" />
              </svg>
            </p>
          </div>
        </div>
      </div>
      <div>
        <div id="portfolioPerformanceChart" className="-ml-5">
          <ReactApexChart options={options} series={state.series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformanceChart;
