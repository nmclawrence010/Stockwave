import { v4 } from "uuid"; //To generate random IDs for the transactions
import { STOCK } from "@/types/stocks";
import { STOCKSELL } from "@/types/stockSell";
import { STOCKWATCHLIST } from "@/types/stockWatchlist";
import { PORTFOLIORECORDEXTRA } from "@/types/userPortfolioDividends";

//Connecting to the AWS DynamoDB function so it can be reused for the different CRUD functions
export function connectAWS() {
  var AWS = require("aws-sdk"); //Load the AWS SDK
  AWS.config.update({
    region: "eu-west-1",
    accessKeyId: process.env.NEXT_PUBLIC_MY_AWS_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_MY_AWS_SECRET_KEY,
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
      ProjectionExpression: "UserID, TransactionID, StockTicker, AverageCost, DateBought, NumberOfShares, LogoURL",
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
            LogoURL: element.LogoURL ? element.LogoURL.S : "",
            NoShares: parseInt(element.NumberOfShares.S, 10),
            AverageCost: parseFloat(element.AverageCost.S),
            TotalPaid: parseInt(element.NumberOfShares.S, 10) * parseFloat(element.AverageCost.S),
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
  logoURL: string,
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
      LogoURL: { S: logoURL },
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
export function getDatabaseItemsSell(dbSellData: STOCKSELL[] = []): Promise<STOCKSELL[]> {
  return new Promise((resolve, reject) => {
    var ddb = connectAWS();

    var user = sessionStorage.getItem("currentUser"); //Potentially some spaghetti interactions here need to retest when live

    var params = {
      ExpressionAttributeValues: {
        ":uid": { S: user },
      },
      KeyConditionExpression: "UserID = :uid",
      ProjectionExpression: "UserID, TransactionID, StockTicker, AverageCost, AverageSellPrice, DateBought, NumberOfShares, LogoURL",
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
            LogoURL: element.LogoURL ? element.LogoURL.S : "",
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

//Sells
export function addDatabaseItemSell(
  userid: string,
  randomHash: string,
  logoURL: string,
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
      LogoURL: { S: logoURL },
      AverageCost: { S: formData.averageCost },
      AverageSellPrice: { S: formData.averageSellPrice },
      NumberOfShares: { S: formData.numberOfShares },
    },
  };

  ddb.putItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

export function deleteDatabaseItemSell(transactionID: string, userId: string) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveSells",
    Key: {
      TransactionID: { S: transactionID },
      UserID: { S: userId },
    },
  };

  ddb.deleteItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

//Dividends
export function getDatabaseItemsDividends(dbDividendData: PORTFOLIORECORDEXTRA[] = []): Promise<PORTFOLIORECORDEXTRA[]> {
  return new Promise((resolve, reject) => {
    var ddb = connectAWS();

    var user = sessionStorage.getItem("currentUser");

    var params = {
      ExpressionAttributeValues: {
        ":uid": { S: user },
      },
      KeyConditionExpression: "UserID = :uid",
      ProjectionExpression: "UserID, TransactionID, StockTicker, Amount, DateBought",
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

  ddb.putItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

export function deleteDatabaseItemDividends(transactionID: string, userId: string) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveSells",
    Key: {
      TransactionID: { S: transactionID },
      UserID: { S: userId },
    },
  };

  ddb.deleteItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

//Watchlist
export function getDatabaseItemsWatchlist(dbWatchlistData: STOCKWATCHLIST[] = []): Promise<STOCKWATCHLIST[]> {
  return new Promise((resolve, reject) => {
    var ddb = connectAWS();

    var user = sessionStorage.getItem("currentUser");

    var params = {
      ExpressionAttributeValues: {
        ":uid": { S: user },
      },
      KeyConditionExpression: "UserID = :uid",
      ProjectionExpression: "UserID, TransactionID, StockTicker, TargetPrice, DateBought, StockNotes",
      TableName: "StockwaveWatchlist",
    };

    ddb.query(params, function (err: any, data: { Items: any[] }) {
      if (err) {
        console.log("Error", err);
        reject(err);
      } else {
        data.Items.forEach(function (element) {
          var obj = {
            Ticker: element.StockTicker.S,
            TargetPrice: element.TargetPrice.S,
            DateAdded: element.DateAdded.S,
            TransactionID: element.TransactionID.S,
            LogoURL: element.LogoURL ? element.LogoURL.S : "",
            StockNotes: element.StockNotes.S,
          };
          dbWatchlistData.push(obj);
        });
        resolve(dbWatchlistData);
      }
    });
  });
}

export function addDatabaseItemWatchlist(
  userid: string,
  randomHash: string,
  formData: {
    stockTicker: string;
    date: string;
    targetPrice: string;
    stockNotes: string;
  },
) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveWatchlist",
    Item: {
      TransactionID: { S: randomHash },
      UserID: { S: userid },
      DateAdded: { S: formData.date || "01/01/2000" },
      StockTicker: { S: formData.stockTicker },
      TargetPrice: { S: formData.targetPrice || "0" },
      StockNotes: { S: formData.stockNotes || "" },
    },
  };

  ddb.putItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}

export function deleteDatabaseItemWatchlist(transactionID: string, userId: string) {
  var ddb = connectAWS();

  var params = {
    TableName: "StockwaveWatchlist",
    Key: {
      TransactionID: { S: transactionID },
      UserID: { S: userId },
    },
  };

  ddb.deleteItem(params, function (err: any, data: any) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
}
