import {
  addDatabaseItemSell,
  generateTransactionID,
} from "@/lib/AWSFunctionality";
import { getCurrentUser } from "@/lib/Auth0Functionality";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";

export default function SellModal({ openModal, closeModal, userId }: any) {
  let [isOpen, setIsOpen] = useState(true);
  let [formData, setFormData] = useState({
    stockTicker: "",
    numberOfShares: "",
    averageCost: "",
    averageSellPrice: "",
    date: "",
  });

  userId = getCurrentUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (
      (name === "numberOfShares" ||
        name === "averageCost" ||
        name === "averageSellPrice") &&
      (!isNaN(Number(value)) || value === "")
    ) {
      setFormData({
        ...formData,
        [name]: value,
      });
    } else if (
      name !== "numberOfShares" &&
      name !== "averageCost" &&
      name !== "averageSellPrice"
    ) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Call the addDatabaseItem function with the form data
    addDatabaseItemSell(userId, generateTransactionID(), formData);

    // Close the modal or perform any other necessary actions
    closeModal();
  };

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Add a new transaction
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                      <form onSubmit={handleSubmit}>
                        <div className="p-6.5">
                          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="mb-4.5">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Ticker Symbol{" "}
                                <span className="text-meta-1">*</span>
                              </label>
                              <input
                                name="stockTicker"
                                value={formData.stockTicker}
                                onChange={handleInputChange}
                                placeholder="Enter the stock ticker"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                              />
                            </div>
                            <div className="w-full xl:w-1/2">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Number of Shares{" "}
                                <span className="text-meta-1">*</span>
                              </label>
                              <input
                                name="numberOfShares"
                                value={formData.numberOfShares}
                                onChange={handleInputChange}
                                type="text"
                                placeholder=""
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                            <div className="w-full xl:w-1/2">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Price Paid{" "}
                                <span className="text-meta-1">*</span>
                              </label>
                              <input
                                name="averageCost"
                                value={formData.averageCost}
                                onChange={handleInputChange}
                                type="text"
                                placeholder=""
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                              />
                            </div>

                            <div className="w-full xl:w-1/2">
                              <label className="mb-2.5 block text-black dark:text-white">
                                Price Sold{" "}
                                <span className="text-meta-1">*</span>
                              </label>
                              <input
                                name="averageSellPrice"
                                value={formData.averageSellPrice}
                                onChange={handleInputChange}
                                type="text"
                                placeholder=""
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                              />
                            </div>
                          </div>

                          <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">
                              Date <span className="text-meta-1">*</span>
                            </label>
                            <div className="relative">
                              <input
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                type="date"
                                className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray"
                          >
                            Submit
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
