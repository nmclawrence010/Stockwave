import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import CurrentHoldingsSubTable from "./CurrentHoldingsSubTable";
import BuyModal from "@/components/Modal/SubmitNewBuy";
import DeleteModal from "../Modal/DeleteModal";
import MultiDeleteModal from "../Modal/MultiDeleteModal";

import { deleteDatabaseItem } from "@/lib/AWSFunctionality";

import { PORTFOLIORECORD } from "@/types/userPortfolio";

interface TableProps {
  tableData: PORTFOLIORECORD[];
  additionalTableData: PORTFOLIORECORD[];
  onSubmitSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

const CurrentHoldingsTable: React.FC<TableProps> = ({ tableData, additionalTableData, onSubmitSuccess, onDeleteSuccess }) => {
  let [isOpen, setIsOpen] = useState(false);
  let [isOpen2, setIsOpen2] = useState(false);
  let [isOpenMulti, setIsOpenMulti] = useState(false);
  let [deleteItemId, setDeleteItemId] = useState<string | null>(null); //For singular transactions
  let [deleteItemsFromAdditionalTable, setDeleteItemsFromAdditionalTable] = useState<string[]>([]); //For batch delete

  // Add state for the additional table
  const [additionalTableVisible, setAdditionalTableVisible] = useState<string | null>(null);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }
  function closeDeleteModal() {
    setIsOpen2(false);
    setIsOpenMulti(false);
    setDeleteItemId(null);
    setDeleteItemsFromAdditionalTable([]);
  }

  function openDeleteModal(transactionID: string) {
    setIsOpen2(true);
    setDeleteItemId(transactionID);
  }

  function openMultiDeleteModal(clickedRowData: PORTFOLIORECORD) {
    // Get the ticker from the clicked row data
    const clickedRowTicker = clickedRowData.Ticker;

    // Filter additional table data based on ticker matching
    const itemsToDelete = additionalTableData.filter((item) => item.Ticker === clickedRowTicker).map((item) => item.TransactionID);

    // Set the delete items and open the multi delete modal
    setIsOpenMulti(true);
    setDeleteItemsFromAdditionalTable(itemsToDelete);
  }

  const handleDeleteClick = () => {
    if (deleteItemId) {
      deleteDatabaseItem(deleteItemId, String(sessionStorage.getItem("currentUser")));
    }
    closeDeleteModal();
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  const handleMultiDeleteClick = () => {
    console.log("DATA BEING PASSED TO AWS:", deleteItemsFromAdditionalTable);
    if (deleteItemsFromAdditionalTable.length > 0) {
      // Loop through the list of TransactionIDs and pass each to our AWS delete function
      deleteItemsFromAdditionalTable.forEach((id) => {
        console.log("TransactionID:", id);
        deleteDatabaseItem(id, String(sessionStorage.getItem("currentUser")));
      });
    }
    closeDeleteModal();
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  //For highlighting the currently open row
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  // Function to toggle the visibility of the additional table
  const toggleAdditionalTable = (transactionID: string) => {
    setAdditionalTableVisible((prevVisible) => (prevVisible === transactionID ? null : transactionID));
    if (highlightedRow === transactionID) {
      setHighlightedRow(null); // Remove highlighting if the same row is clicked again
    } else {
      setHighlightedRow(transactionID); // Highlight the clicked row
    }
    // if (onDeleteSuccess) {
    //   onDeleteSuccess();          Uses too many api calls when open the sub table
    // }
  };

  // For the open closed eye buttons
  const primaryPath =
    "M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z";
  const toggledPath =
    "M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c8.4-19.3 10.6-41.4 4.8-63.3c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zM373 389.9c-16.4 6.5-34.3 10.1-53 10.1c-79.5 0-144-64.5-144-144c0-6.9 .5-13.6 1.4-20.2L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5L373 389.9z";

  useEffect(() => {}, [tableData, additionalTableData, deleteItemsFromAdditionalTable]);

  // Sort the tableData by MarketValue in descending order
  const sortedTableData = [...tableData].sort((a, b) => b.MarketValue - a.MarketValue);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 shadow-default dark:border-simplybackground dark:bg-simplybackground sm:px-7.5 xl:pb-1">
      <div className="border-b border-stroke dark:border-strokedark flex justify-between items-center">
        <h4 className="mb-1 mt-4.5 text-title-xl2 font-semibold text-black dark:text-white">My Stocks</h4>
        <button
          onClick={openModal}
          className="inline-flex items-center justify-center gap-2.5 rounded-md bg-stockwaveblue dark:bg-boxdark py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 dark:hover:bg-opacity-70 lg:px-8 xl:px-10"
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" className="fill-current" width="20" height="20" viewBox="0 0 448 512">
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z" />
            </svg>
          </span>
          Add new
        </button>
      </div>

      <div>
        {isOpen && (
          <BuyModal openModal={openModal} closeModal={closeModal} onSubmitSuccess={onSubmitSuccess} onDeleteSuccess={onDeleteSuccess} />
        )}
      </div>
      <div>
        {isOpen2 && (
          <DeleteModal
            openModal={openDeleteModal}
            closeModal={closeDeleteModal}
            onDelete={handleDeleteClick}
            onDeleteSuccess={onDeleteSuccess}
          />
        )}
      </div>
      <div>
        {isOpenMulti && (
          <MultiDeleteModal
            openModal={openMultiDeleteModal}
            closeModal={closeDeleteModal}
            onDelete={handleMultiDeleteClick}
            onDeleteSuccess={onDeleteSuccess}
          />
        )}
      </div>
      <div className="flex flex-col">
        <div className="mb-1 justify-evenly grid grid-cols-3 rounded-md bg-stockwaveblue font-medium text-white text-center dark:text-bodydark2 dark:bg-simplybackground sm:grid-cols-9">
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">Stock</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">Current Price</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">Today&apos;s Change</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">No. of Shares</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">Average Cost</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">Value</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">P&L</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base">P&L %</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base"></h5>
          </div>
        </div>

        {sortedTableData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-9 ${
              key === tableData.length - 0 ? "" : "rounded-xl border-b mb-3 border-stroke dark:border-strokedark dark:bg-boxdark"
            }`}
            key={key}
          >
            <Link href={`/stocks/${brand.Ticker}`}>
              <div className="group flex items-center gap-3 p-2.5 xl:p-5 h-20">
                <div className="flex-shrink-0 items-center h-12 w-12 flex rounded-md overflow-hidden ring-4 ring-boxdark group-hover:ring-stockwaveyellow">
                  <Image src={brand.LogoURL} alt="Missing Logo :(" width={48} height={48} className="object-contain" />
                </div>
                <p className="text-lg group-hover:text-stockwaveyellow group-hover:underline underline-offset-2 text-black dark:text-white font-bold">
                  <span className="ml-3">{brand.Ticker}</span>
                </p>
              </div>
            </Link>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <b>
                <p className={brand.ChangeInPrice < 0 ? "text-meta-1" : "text-meta-3"}>{Number(brand.CurrentPrice).toFixed(2)}</p>
              </b>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <b>
                <p className={`${brand.ChangeInPrice < 0 ? "text-meta-1" : "text-meta-3"}`}>
                  {Number(brand.ChangeInPrice).toFixed(2)}
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  {Number(brand.ChangeInPricePercent).toFixed(2)}%
                </p>
              </b>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white font-bold">
                {Number.isInteger(brand.NoShares) ? brand.NoShares : brand.NoShares.toFixed(3)}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white font-bold">{brand.AverageCost.toFixed(2)}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white font-bold">{brand.MarketValue.toFixed(2)}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <b>
                <p className={`${brand.GainLoss < 0 ? "text-meta-1" : "text-meta-3"}`}>{brand.GainLoss.toFixed(2)}</p>
              </b>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <b>
                <p className={`${brand.GainLoss < 0 ? "text-meta-1" : "text-meta-3"}`}>
                  {((brand.GainLoss / brand.TotalPaid) * 100).toFixed(2)}%
                </p>
              </b>
            </div>

            <div className="flex items-center space-x-3.5">
              <button onClick={() => toggleAdditionalTable(brand.TransactionID)} className="hover:text-primary">
                <svg className="fill-current" width="18" height="18" viewBox="0 0 576 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d={highlightedRow === brand.TransactionID ? toggledPath : primaryPath} />
                </svg>
              </button>
              <button onClick={() => openMultiDeleteModal(brand)} className="hover:text-meta-1">
                <svg className="fill-current" width="18" height="18" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                </svg>
              </button>
            </div>
            {/* Render the additional table if the corresponding button is clicked */}

            <div
              className={`${
                additionalTableVisible === brand.TransactionID
                  ? "col-span-7 sm:col-span-12" // Adjust the column span as needed
                  : "hidden"
              }`}
            >
              <CurrentHoldingsSubTable
                tableData={tableData}
                transactionID={brand.TransactionID}
                additionalData={additionalTableData}
                onSubmitSuccess={onSubmitSuccess}
                onDeleteSuccess={onDeleteSuccess}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentHoldingsTable;
function setIsOpen(arg0: boolean) {
  throw new Error("Function not implemented.");
}
