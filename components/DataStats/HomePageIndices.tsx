import React, { useState, useEffect } from "react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import ChartEleven from "../Charts/ChartEleven";
import Image from "next/image";
import { fetchStockQuote } from "@/lib/StockAPIFunctionality";

interface Stats {
  image: string;
  name: string;
  symbol: string; // Add the symbol property
  share: number;
  returnRate: number;
}

const DataStatsIndices: React.FC = () => {
  const [statsItems, setStatsItems] = useState<Stats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const symbols = ["SPX", "NDX", "FTSE", "DJI"];
        const data: Stats[] = await Promise.all(
          symbols.map(async (symbol) => {
            const stockData = await fetchStockQuote(symbol);
            const { name, close, percent_change } = stockData;
            const image = symbol === "FTSE" ? "/images/flags/uk-flag.gif" : "/images/flags/us-flag.gif";
            return {
              image,
              name: name.length > 10 ? symbol : name, // Use symbol if name is too long
              symbol, // Add the symbol property
              share: close,
              returnRate: percent_change,
            };
          }),
        );
        setStatsItems(data);
      } catch (error) {
        console.error("Error fetching stock data:", error);
      }
    };

    fetchData();
  }, []);
  return (
    <>
      <div className="data-stats-slider-outer relative col-span-12 rounded-sm border border-stroke bg-white py-10 shadow-default dark:border-strokedark dark:bg-boxdark">
        <Swiper
          className="dataStatsSlider swiper !-mx-px"
          modules={[Navigation]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          slidesPerView={1}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1280: {
              slidesPerView: 3,
            },
            1536: {
              slidesPerView: 4,
            },
          }}
        >
          {statsItems.map((item, key) => (
            <SwiperSlide key={key} className="border-r border-stroke px-10 last:border-r-0 dark:border-strokedark">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10.5 w-10.5 overflow-hidden rounded-full">
                    <Image
                      src={item.image}
                      alt="flag"
                      width={42}
                      height={42}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover", // Add this line
                      }}
                    />
                  </div>
                  <h4 className="text-xl font-bold text-black dark:text-white">{item.name}</h4>
                </div>

                <ChartEleven returnRate={item.returnRate} />
              </div>
              <div className="mt-5.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-medium">Total Share</p>

                  <p className="font-medium text-black dark:text-white">${item.share}</p>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-medium">Total Return</p>

                  <p className={`flex items-center gap-1 font-medium ${item.returnRate >= 0 ? "text-meta-3" : "text-red"}`}>
                    {item.returnRate}%
                    {item.returnRate >= 0 ? (
                      <svg className="fill-current" width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.83258 0.417479L10.8364 7.91748L0.828779 7.91748L5.83258 0.417479Z" fill="" />
                      </svg>
                    ) : (
                      <svg className="fill-current" width="11" height="9" viewBox="0 0 11 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.83246 8.41748L0.828662 0.91748L10.8363 0.91748L5.83246 8.41748Z" fill="" />
                      </svg>
                    )}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="swiper-button-prev">
          <svg className="fill-current" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15.8562 2.80185C16.0624 2.80185 16.2343 2.8706 16.4062 3.0081C16.7155 3.31748 16.7155 3.79873 16.4062 4.1081L9.1874 11.4987L16.4062 18.855C16.7155 19.1644 16.7155 19.6456 16.4062 19.955C16.0968 20.2644 15.6155 20.2644 15.3062 19.955L7.5374 12.0487C7.22803 11.7394 7.22803 11.2581 7.5374 10.9487L15.3062 3.04248C15.4437 2.90498 15.6499 2.80185 15.8562 2.80185Z"
              fill=""
            />
          </svg>
        </div>
        <div className="swiper-button-next">
          <svg className="fill-current" width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M8.08721 20.1957C7.88096 20.1957 7.70908 20.127 7.53721 19.9895C7.22783 19.6801 7.22783 19.1988 7.53721 18.8895L14.756 11.4988L7.53721 4.14258C7.22783 3.8332 7.22783 3.35195 7.53721 3.04258C7.84658 2.7332 8.32783 2.7332 8.63721 3.04258L16.406 10.9488C16.7153 11.2582 16.7153 11.7395 16.406 12.0488L8.63721 19.9551C8.49971 20.0926 8.29346 20.1957 8.08721 20.1957Z"
              fill=""
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default DataStatsIndices;
