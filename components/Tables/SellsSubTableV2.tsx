import { useEffect, useState } from "react";
import DeleteModal from "../Modal/DeleteModal";
import SellModal from "../Modal/SubmitNewSell";
import { deleteDatabaseItemSell } from "@/lib/AWSFunctionality";
import { PORTFOLIORECORDSELL } from "@/types/userPortfolioSell";
import React from "react";

// Define the props type
interface AdditionalTableProps {
  tableData: PORTFOLIORECORDSELL[];
  transactionID: string;
  additionalData: PORTFOLIORECORDSELL[];
  onSubmitSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

const SellsSubTableV2: React.FC<AdditionalTableProps> = ({
  tableData,
  transactionID,
  additionalData,
  onSubmitSuccess,
  onDeleteSuccess,
}) => {
  // Find the corresponding Ticker from tableData
  const correspondingTicker = tableData.find((data) => data.TransactionID === transactionID)?.Ticker;

  // Filter the rows based on the Ticker matching the main table's row
  const filteredTableData = additionalData.filter((data) => data.Ticker === correspondingTicker);
  let [isOpenDelete, setIsOpenDelete] = useState(false);
  let [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  let [isOpenEdit, setIsOpenEdit] = useState(false);
  let [editItemId, setEditItemId] = useState<string | null>(null);

  function closeDeleteModal() {
    setIsOpenDelete(false);
    setDeleteItemId(null);
  }

  function openDeleteModal(transactionID: string) {
    setIsOpenDelete(true);
    setDeleteItemId(transactionID);
  }

  function openEditModal(transactionID: string) {
    setIsOpenEdit(true);
    setEditItemId(transactionID);
  }

  function closeEditModal() {
    setIsOpenEdit(false);
    setEditItemId(null);
  }

  const handleDeleteClick = () => {
    if (deleteItemId) {
      deleteDatabaseItemSell(deleteItemId, String(sessionStorage.getItem("currentUser")));
    }
    closeDeleteModal();
    if (onDeleteSuccess) {
      onDeleteSuccess();
    }
  };

  useEffect(() => {}, [tableData]);

  return (
    <div className="rounded-b-xl border-t border-stroke bg-white pb-2.5 dark:border-strokedark dark:bg-boxdark xl:pb-1">
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
      <div className="flex flex-col"></div>
      {filteredTableData
        .sort((a, b) => new Date(a.DateBought).getTime() - new Date(b.DateBought).getTime()) // Sort by DateBought
        .map((data, index) => (
          <React.Fragment key={index}>
            <div
              className={`grid grid-cols-3 sm:grid-cols-8 ${
                index === filteredTableData.length - 1 ? "" : " border-stroke dark:border-strokedark"
              }`}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5 font-medium">
                <p className="hidden text-black dark:text-white sm:block">{data.DateBought}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 font-medium">
                <p className="text-black dark:text-white">{data.NoShares}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 font-medium">
                <p className="text-black dark:text-white">{data.AverageCost}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 font-medium">
                <p className="text-black dark:text-white">{data.AverageSellPrice}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 font-medium">
                <p className="text-black dark:text-white">{data.TotalPaid.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 font-medium">
                <p className={`${data.GainLoss < 0 ? "text-meta-1" : "text-meta-3"}`}>{data.GainLoss.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5 font-medium">
                <p className={`${data.GainLoss < 0 ? "text-meta-1" : "text-meta-3"}`}>
                  {((data.GainLoss / data.TotalPaid) * 100).toFixed(2)}%
                </p>
              </div>

              <div className="flex items-center space-x-3.5">
                <button
                  onClick={() => {
                    openEditModal(data.TransactionID);
                    onSubmitSuccess && onSubmitSuccess();
                  }}
                  className="hover:text-stockwaveyellow"
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                      fill=""
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    openDeleteModal(data.TransactionID);
                    onDeleteSuccess && onDeleteSuccess();
                  }}
                  className="hover:text-meta-1"
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
                  </svg>
                </button>
              </div>
            </div>
            {isOpenEdit && (
              <div className="mt-4">
                <SellModal
                  openModal={openEditModal}
                  closeModal={closeEditModal}
                  onSubmitSuccess={onSubmitSuccess}
                  mode="edit"
                  initialData={{
                    transactionID: data.TransactionID,
                    stockTicker: data.Ticker,
                    numberOfShares: data.NoShares,
                    averageCost: data.AverageCost,
                    averageSellPrice: data.AverageSellPrice,
                    date: data.DateBought,
                  }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
    </div>
  );
};

export default SellsSubTableV2;
