import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import WatchlistModal from "../Modal/SubmitNewWatchlist";
import DeleteModal from "../Modal/DeleteModal";
import MultiDeleteModal from "../Modal/MultiDeleteModal";

import { deleteDatabaseItemWatchlist } from "@/lib/AWSFunctionality";

import { PORTFOLIOWATCHLIST } from "@/types/userWatchlist";

interface TableProps {
  tableData: PORTFOLIOWATCHLIST[];
  onSubmitSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

const WatchlistTable: React.FC<TableProps> = ({ tableData, onSubmitSuccess, onDeleteSuccess }) => {
  let [isOpenSubmit, setIsOpenSubmit] = useState(false);
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  let [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  function closeModal() {
    setIsOpenSubmit(false);
  }

  function openModal() {
    setIsOpenSubmit(true);
  }

  function closeDeleteModal() {
    setIsOpenDelete(false);
    setDeleteItemId(null);
  }

  function openDeleteModal(transactionID: string) {
    setIsOpenDelete(true);
    setDeleteItemId(transactionID);
  }

  const handleDeleteClick = () => {
    if (deleteItemId) {
      deleteDatabaseItemWatchlist(deleteItemId, String(sessionStorage.getItem("currentUser")));
    }
    closeDeleteModal();
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  useEffect(() => {}, [tableData, deleteItemId]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 shadow-default dark:border-simplybackground dark:bg-simplybackground sm:px-7.5 xl:pb-1">
      <div className="border-b border-stroke dark:border-strokedark flex justify-between items-center">
        <h4 className="mb-1 mt-4.5 text-title-xl2 font-semibold text-black dark:text-white">My Watchlist</h4>
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
        {isOpenSubmit && (
          <WatchlistModal
            openModal={openModal}
            closeModal={closeModal}
            onSubmitSuccess={onSubmitSuccess}
            onDeleteSuccess={onDeleteSuccess}
          />
        )}
      </div>
      <div>
        {isOpenDelete && (
          <DeleteModal
            openModal={openDeleteModal}
            closeModal={closeDeleteModal}
            onDelete={handleDeleteClick}
            onDeleteSuccess={onDeleteSuccess}
          />
        )}
      </div>

      <div className="flex flex-col">
        <div className="mb-1 justify-evenly grid grid-cols-3 rounded-md bg-stockwaveblue font-medium text-white text-center dark:text-bodydark2 dark:bg-simplybackground sm:grid-cols-5">
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
            <h5 className="text-sm font-medium xsm:text-base">Target Price</h5>
          </div>
          <div className="p-1.5 text-center xl:p-3">
            <h5 className="text-sm font-medium xsm:text-base"></h5>
          </div>
        </div>

        {tableData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5  ${
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
              <p className="text-black dark:text-white font-bold">{brand.TargetPrice ? Number(brand.TargetPrice).toFixed(2) : "0.00"}</p>
            </div>
            <div className="flex items-center space-x-3.5">
              <button onClick={() => openDeleteModal(brand.TransactionID)} className="hover:text-meta-1">
                <svg className="fill-current" width="18" height="18" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchlistTable;
function setIsOpen(arg0: boolean) {
  throw new Error("Function not implemented.");
}
