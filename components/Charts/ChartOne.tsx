"use client";
import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { fetchSPX } from "@/lib/StockAPIFunctionality";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ChartOne: React.FC = () => {
  const [chartData, setChartData] = useState<
    { name: string; data: number[] }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchSPX();
        // Extract "open" values from the API response and reverse the order
        const openValues = data.values
          .map((item: any) => parseFloat(item.open))
          .reverse();
        setChartData([
          { name: "S&P500", data: openValues },
          {
            name: "Product Two",
            data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
          }, // Example data for Product Two
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const maxChartValue = Math.max(...chartData.flatMap((series) => series.data));
  const minChartValue = Math.min(
    ...(chartData.find((item) => item.name === "S&P500")?.data ?? []),
  );

  const currentMonth = new Date().getMonth(); // Get current month (0-indexed)
  const currentYear = new Date().getFullYear(); // Get current year
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Construct categories array starting from 11 months ago to the current month
  const categories = [];
  for (let i = currentMonth; i >= currentMonth - 11; i--) {
    const monthIndex = i < 0 ? 12 + i : i; // Handle negative indices (wrap around to previous year)
    categories.push(`${months[monthIndex]}, ${currentYear}`);
  }

  const productOneData = chartData.find((item) => item.name === "S&P500")?.data;
  const productTwoData = chartData.find(
    (item) => item.name === "Product Two",
  )?.data;

  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"],
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
        opacity: 0.1,
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
      strokeColors: ["#3056D3", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
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
              <div className="w-full">
                <p className="font-semibold text-primary">S&P 500</p>
                <p className="text-sm font-medium">Last 12 months</p>
              </div>
            </div>
            <div className="flex min-w-47.5">
              <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
                <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
              </span>
              <div className="w-full">
                <p className="font-semibold text-secondary">You</p>
                <p className="text-sm font-medium">Last 12 months</p>
              </div>
            </div>
          </div>
        </div>
        <div id="chartOne" className="-ml-5 h-[355px] w-[105%]">
          <ReactApexChart
            options={options}
            series={[
              { name: "S&P500", data: productOneData ?? [] },
              { name: "Product Two", data: productTwoData ?? [] },
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

export default ChartOne;
