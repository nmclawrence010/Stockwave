// "use client";

// import React, { Component } from "react";
// import { IgrFinancialChart } from "igniteui-react-charts";
// import { IgrFinancialChartModule } from "igniteui-react-charts";
// import { fetchSPX52Weekly } from "@/lib/StockAPIFunctionality";
// import { NextPage } from "next"; // Import NextPage type from next

// IgrFinancialChartModule.register();

// // Define interface for component state
// interface FinancialChartCustomDataState {
//   data: any[]; // Adjust the type according to your data structure
// }

// // Use NextPage type for props
// const FinancialChartCustomData: NextPage = () => {
//   const [data, setData] = React.useState<FinancialChartCustomDataState["data"]>([]);

//   React.useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const responseData = await fetchSPX52Weekly();
//       const transformedData = responseData.values.map(
//         (item: { datetime: string | number | Date; open: string; high: string; low: string; close: string; volume: string }) => ({
//           date: new Date(item.datetime), // Renaming "datetime" to "date"
//           open: parseFloat(item.open),
//           high: parseFloat(item.high),
//           low: parseFloat(item.low),
//           close: parseFloat(item.close),
//           volume: parseFloat(item.volume),
//         }),
//       );
//       setData(transformedData);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   return (
//     <div className="col-span-12 rounded-xl border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-black dark:bg-black sm:px-7.5 xl:col-span-8">
//       <div>
//         <div id="portfolioperformancechart" className="h-[355px] w-full items-center text-white">
//           <IgrFinancialChart
//             width="100%"
//             height="100%"
//             chartType="Line"
//             thickness={2}
//             //chartTitle="Your Chart Title"
//             subtitle="Previous 52 Weeks"
//             yAxisMode="PercentChange"
//             //yAxisTitle="Percent Changed"
//             //yAxisMinimumValue={-20}
//             //yAxisMaximumValue={20}
//             //yAxisInterval="20"
//             dataSource={data}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FinancialChartCustomData;
