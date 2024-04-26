import React, { ReactNode } from "react";

interface CardDataStatsProps {
  title: string;
  total: string;
  rate: string;
  children: ReactNode;
  height?: string;
  tooltipText: string;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({ title, total, rate, children, height = "auto", tooltipText }) => {
  let additionalText = tooltipText;

  // For changing the negative numbers to display as (-$1000) instead of ($-1000)
  const totalNumber = parseFloat(total);
  const formattedTotal = totalNumber < 0 ? `-$${Math.abs(totalNumber)}` : `$${totalNumber}`;

  return (
    <div
      className="relative flex flex-col justify-center rounded-xl border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-black dark:bg-black"
      style={{ height }}
    >
      {/* Left-hand color strip */}
      <div className="absolute left-0 h-full bg-stockwaveblue dark:bg-boxdark rounded-l-xl" style={{ width: "21%" }}></div>

      <div className="relative flex justify-center items-center mb-4">
        <div className="absolute top-1/2 2xl:left-0 -left-4">{children}</div>
        <div className="text-center pl-24.5">
          <span className="text-md font-medium">{title}</span>
          <h4 className="text-title-xl font-bold text-black dark:text-white">{formattedTotal}</h4>
        </div>
      </div>
      <div className="relative flex justify-center items-center">
        <div className="group relative inline-block pl-24.5">
          <span className={`flex items-center gap-1 text-lg font-medium ${parseFloat(rate) > 0 ? "text-meta-3" : "text-meta-1"}`}>
            {rate}

            {parseFloat(rate) > 0 && (
              <svg className="fill-meta-3" width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                  fill=""
                />
              </svg>
            )}
            {parseFloat(rate) < 0 && (
              <svg className="fill-meta-1" width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                  fill=""
                />
              </svg>
            )}
          </span>
          <div
            className="absolute top-full left-1/2 z-20 mt-3 -translate-x-1/2 whitespace-nowrap rounded bg-black px-4.5 py-1.5 text-sm font-medium text-white opacity-0 group-hover:opacity-100"
            dangerouslySetInnerHTML={{ __html: additionalText }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CardDataStats;
