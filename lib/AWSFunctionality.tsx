import { v4 } from "uuid"; //To generate random IDs for the transactions
import { STOCK } from "@/types/stocks";
import { fetchStockData } from "./StockAPIFunctionality";

//Connecting to the AWS DynamoDB function so it can be reused for the different CRUD functions
export function connectAWS() {
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
// export function getDatabaseItems(dbData: STOCK[] = []) {
//   var ddb = connectAWS();

//   var params = {
//     ExpressionAttributeValues: {
//       ":uid": { S: "123" },
//     },
//     KeyConditionExpression: "UserID = :uid",
//     ProjectionExpression:
//       "UserID, TransactionID, Notes, StockTicker, AverageCost, DateBought, NumberOfShares",
//     TableName: "StockwaveBuys2",
//   };

//   ddb.query(params, function (err: any, data: { Items: any[] }) {
//     if (err) {
//       console.log("Error", err);
//     } else {
//       //console.log("Success", data.Items);
//       data.Items.forEach(function (element, index, array) {
//         //console.log(element.TransactionID.S + " (" + element.StockTicker.S + ")");

//         var obj = {
//           Ticker: element.StockTicker.S,
//           NoShares: element.NumberOfShares.S,
//           AverageCost: element.AverageCost.S,
//           MarketValue:
//             Number(element.NumberOfShares.S) * Number(element.AverageCost.S),
//         };
//         dbData.push(obj);
//       });
//     }
//   });
// }

export function getDatabaseItems(dbData: STOCK[] = []): Promise<STOCK[]> {
  return new Promise((resolve, reject) => {
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
        reject(err);
      } else {
        data.Items.forEach(function (element) {
          var obj = {
            Ticker: element.StockTicker.S,
            NoShares: parseInt(element.NumberOfShares.S, 10),
            AverageCost: parseFloat(element.AverageCost.S),
            MarketValue:
              parseInt(element.NumberOfShares.S, 10) *
              parseFloat(element.AverageCost.S),
            DateBought: element.DateBought.S,
          };
          dbData.push(obj);
        });
        resolve(dbData);
      }
    });
  });
}

//Function to add records to the DynamoDB
export function addDatabaseItem(userid: string, randomHash: string) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveBuys",
    Item: {
      TransactionID: { S: randomHash },
      UserID: { S: userid },
      DateBought: { S: "01/01/2000" },
      StockTicker: { S: "Richard Roe" },
      AverageCost: { S: "Richard Roe" },
      NumberOfShares: { S: "Richard Roe" },
      Notes: { S: "Richard Roe" },
    },
  };

  // Call DynamoDB to add the item to the table
  ddb.putItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

//Function to delete records from the DynamoDB
export function deleteDatabaseItem() {
  var ddb = connectAWS();
}

//Generates a random hash to be used for the transaction ID in the database
function generateTransactionID() {
  var randomID = v4();
  return randomID;
}
