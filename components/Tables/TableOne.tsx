import { STOCK } from "@/types/stocks";

import Image from "next/image";

const dbData: STOCK[] = [];

//Connecting to the AWS DynamoDB function so it can be reused for the different CRUD functions
function connectAWS() {
  var AWS = require("aws-sdk"); //Load the AWS SDK
  AWS.config.update({
    region: "eu-west-1",
    accessKeyId: "AKIA2UC3CODSG6HZTVKN",
    secretAccessKey: "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",
  }); //Set the region

  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" }); //Creating a DynamoDB service object
  return ddb;
}

//Function to retrieve records from the DynamoDB
//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-query-scan.html
export function getDatabaseItems() {
  var ddb = connectAWS();

  var params = {
    ExpressionAttributeValues: {
      ":uid": { S: "123" },
    },
    KeyConditionExpression: "UserID = :uid",
    ProjectionExpression:
      "UserID, TransactionID, Notes, StockTicker, AverageCost, DateBought, NumberOfShares",
    TableName: "StockwaveBuys2",
  };

  ddb.query(params, function (err: any, data: { Items: any[] }) {
    if (err) {
      console.log("Error", err);
    } else {
      //console.log("Success", data.Items);
      data.Items.forEach(function (element, index, array) {
        //console.log(element.TransactionID.S + " (" + element.StockTicker.S + ")");

        var obj = {
          Ticker: element.StockTicker.S,
          NoShares: element.NumberOfShares.S,
          AverageCost: element.AverageCost.S,
        };
        //console.log(obj);
        dbData.push(obj);
      });
    }
  });
  //console.log(dbData);
}

const TableOne = () => {
  getDatabaseItems();
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        My Portfolio
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-5">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Stock
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              No. of Shares
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Average Cost
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Market Value
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Total Gain
            </h5>
          </div>
        </div>

        {dbData.map((brand, key) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-5 ${
              key === dbData.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <div className="flex-shrink-0">
                <Image
                  src={"/images/brand/brand-03.svg"}
                  alt="Brand"
                  width={48}
                  height={48}
                />
              </div>
              <p className="hidden text-black dark:text-white sm:block">
                {brand.Ticker}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.NoShares}</p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-black dark:text-white">{brand.AverageCost}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
