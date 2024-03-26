import { v4 } from "uuid"; //To generate random IDs for the transactions
import { STOCK } from "@/types/stocks";
import { STOCKSELL } from "@/types/stockSell";
import { PORTFOLIORECORDEXTRA } from "@/types/userPortfolioDividends";

//Connecting to the AWS DynamoDB function so it can be reused for the different CRUD functions
export function connectAWS() {
  var AWS = require("aws-sdk"); //Load the AWS SDK
  AWS.config.update({
    region: "eu-west-1",
    accessKeyId: "AKIA2UC3CODSG6HZTVKN",
    secretAccessKey: "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",
  }); //Set the region and keys

  var ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" }); //Creating a DynamoDB service object
  return ddb;
}

export function getDatabaseItems(dbData: STOCK[] = []): Promise<STOCK[]> {
  return new Promise((resolve, reject) => {
    var ddb = connectAWS();

    var user = sessionStorage.getItem("currentUser"); //Potentially some spaghetti interactions here need to retest when live

    var params = {
      ExpressionAttributeValues: {
        ":uid": { S: user },
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
            TotalPaid:
              parseInt(element.NumberOfShares.S, 10) *
              parseFloat(element.AverageCost.S),
            DateBought: element.DateBought.S,
            TransactionID: element.TransactionID.S,
          };
          dbData.push(obj);
        });
        resolve(dbData);
      }
    });
  });
}

//Function to add records to the DynamoDB
export function addDatabaseItem(
  userid: string,
  randomHash: string,
  formData: {
    stockTicker: string;
    numberOfShares: string;
    averageCost: string;
    date: string;
  },
) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveBuys2",
    Item: {
      TransactionID: { S: randomHash },
      UserID: { S: userid },
      DateBought: { S: formData.date || "01/01/2000" },
      StockTicker: { S: formData.stockTicker },
      AverageCost: { S: formData.averageCost },
      NumberOfShares: { S: formData.numberOfShares },
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
export function deleteDatabaseItem(transactionID: string, userId: string) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveBuys2",
    Key: {
      TransactionID: { S: transactionID },
      UserID: { S: userId },
    },
  };

  // Call DynamoDB to delete the item from the table
  ddb.deleteItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

//Generates a random hash to be used for the transaction ID in the database
export function generateTransactionID() {
  var randomID = v4();
  return randomID;
}

//Same as the function for getting user records but from the Sell table
export function getDatabaseItemsSell(
  dbSellData: STOCKSELL[] = [],
): Promise<STOCKSELL[]> {
  return new Promise((resolve, reject) => {
    var ddb = connectAWS();

    var user = sessionStorage.getItem("currentUser"); //Potentially some spaghetti interactions here need to retest when live

    var params = {
      ExpressionAttributeValues: {
        ":uid": { S: user },
      },
      KeyConditionExpression: "UserID = :uid",
      ProjectionExpression:
        "UserID, TransactionID, StockTicker, AverageCost, AverageSellPrice, DateBought, NumberOfShares",
      TableName: "StockwaveSells",
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
            AverageSellPrice: parseFloat(element.AverageSellPrice.S),
            DateBought: element.DateBought.S,
            TransactionID: element.TransactionID.S,
          };
          dbSellData.push(obj);
        });
        resolve(dbSellData);
      }
    });
  });
}

//Modified version of the ADD function for the SELL table
export function addDatabaseItemSell(
  userid: string,
  randomHash: string,
  formData: {
    stockTicker: string;
    numberOfShares: string;
    averageCost: string;
    averageSellPrice: string;
    date: string;
  },
) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveSells",
    Item: {
      TransactionID: { S: randomHash },
      UserID: { S: userid },
      DateBought: { S: formData.date || "01/01/2000" },
      StockTicker: { S: formData.stockTicker },
      AverageCost: { S: formData.averageCost },
      AverageSellPrice: { S: formData.averageSellPrice },
      NumberOfShares: { S: formData.numberOfShares },
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

///Modified version of the DELETE function for the SELL table
export function deleteDatabaseItemSell(transactionID: string, userId: string) {
  var ddb = connectAWS();
  console.log("AWS ITEM 1:", transactionID);
  console.log("AWS ITEM 2:", userId);

  var params = {
    TableName: "StockwaveSells",
    Key: {
      TransactionID: { S: transactionID },
      UserID: { S: userId },
    },
  };

  // Call DynamoDB to delete the item from the table
  ddb.deleteItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

//Same as the function for getting user records but from the Sell table
export function getDatabaseItemsDividends(
  dbDividendData: PORTFOLIORECORDEXTRA[] = [],
): Promise<PORTFOLIORECORDEXTRA[]> {
  return new Promise((resolve, reject) => {
    var ddb = connectAWS();

    var user = sessionStorage.getItem("currentUser");

    var params = {
      ExpressionAttributeValues: {
        ":uid": { S: user },
      },
      KeyConditionExpression: "UserID = :uid",
      ProjectionExpression:
        "UserID, TransactionID, StockTicker, Amount, DateBought",
      TableName: "StockwaveDividends",
    };

    ddb.query(params, function (err: any, data: { Items: any[] }) {
      if (err) {
        console.log("Error", err);
        reject(err);
      } else {
        data.Items.forEach(function (element) {
          var obj = {
            Ticker: element.StockTicker.S,
            Amount: parseFloat(element.Amount.S),
            DateBought: element.DateBought.S,
            TransactionID: element.TransactionID.S,
          };
          dbDividendData.push(obj);
        });
        resolve(dbDividendData);
      }
    });
  });
}

//Modified version of the ADD function for the SELL table
export function addDatabaseItemDividends(
  userid: string,
  randomHash: string,
  formData: {
    stockTicker: string;
    date: string;
    amount: string;
  },
) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveDividends",
    Item: {
      TransactionID: { S: randomHash },
      UserID: { S: userid },
      DateBought: { S: formData.date || "01/01/2000" },
      StockTicker: { S: formData.stockTicker },
      Amount: { S: formData.amount },
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

///Modified version of the DELETE function for the EXTRA dividend/cash table
export function deleteDatabaseItemExtra(transactionID: string, userId: string) {
  var ddb = connectAWS();
  console.log("AWS ITEM 1:", transactionID);
  console.log("AWS ITEM 2:", userId);

  var params = {
    TableName: "StockwaveSells",
    Key: {
      TransactionID: { S: transactionID },
      UserID: { S: userId },
    },
  };

  // Call DynamoDB to delete the item from the table
  ddb.deleteItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}
