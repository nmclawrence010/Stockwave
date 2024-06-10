import { UpdateItemInput, UpdateItemOutput } from "aws-sdk/clients/dynamodb";

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

// For updating existing records on the Current Holdings table
export function updateDatabaseItem(
  transactionID: string,
  userId: string,
  updatedFormData: {
    stockTicker?: string;
    numberOfShares?: string;
    averageCost?: string;
    date?: string;
  },
): Promise<UpdateItemOutput> {
  const ddb = connectAWS();

  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  Object.entries(updatedFormData).forEach(([key, value], index) => {
    if (value !== undefined) {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      const mappedKey = mapKeyToAttribute(key);

      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = mappedKey;
      expressionAttributeValues[attributeValue] = { S: value };
    }
  });

  const params: UpdateItemInput = {
    TableName: "StockwaveBuys2",
    Key: {
      UserID: { S: userId }, // Partition key
      TransactionID: { S: transactionID }, // Sort key
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  return ddb.updateItem(params).promise();
}

// Helper function to map the form field keys to the correct attribute names
function mapKeyToAttribute(key: string): string {
  switch (key) {
    case "stockTicker":
      return "StockTicker";
    case "numberOfShares":
      return "NumberOfShares";
    case "averageCost":
      return "AverageCost";
    case "averageSellPrice":
      return "AverageSellPrice";
    case "date":
      return "DateBought";
    default:
      return key;
  }
}

// For updating existing records on the Sells table
export function updateDatabaseItemSell(
  transactionID: string,
  userId: string,
  updatedFormData: {
    stockTicker?: string;
    numberOfShares?: string;
    averageCost?: string;
    averageSellPrice?: string;
    date?: string;
  },
): Promise<UpdateItemOutput> {
  const ddb = connectAWS();

  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  Object.entries(updatedFormData).forEach(([key, value], index) => {
    if (value !== undefined) {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      const mappedKey = mapKeyToAttribute(key);

      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = mappedKey;
      expressionAttributeValues[attributeValue] = { S: value };
    }
  });

  const params: UpdateItemInput = {
    TableName: "StockwaveSells",
    Key: {
      UserID: { S: userId }, // Partition key
      TransactionID: { S: transactionID }, // Sort key
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  return ddb.updateItem(params).promise();
}

// For updating existing records on the Sells table
export function updateDatabaseItemWatchlist(
  transactionID: string,
  userId: string,
  updatedFormData: {
    stockTicker?: string;
    targetPrice?: string;
    stockNotes?: string;
  },
): Promise<UpdateItemOutput> {
  const ddb = connectAWS();

  const updateExpressions: string[] = [];
  const expressionAttributeValues: Record<string, any> = {};
  const expressionAttributeNames: Record<string, string> = {};

  Object.entries(updatedFormData).forEach(([key, value], index) => {
    if (value !== undefined) {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      const mappedKey = mapKeyToAttribute(key);

      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = mappedKey;
      expressionAttributeValues[attributeValue] = { S: value };
    }
  });

  const params: UpdateItemInput = {
    TableName: "StockwaveWatchlist",
    Key: {
      UserID: { S: userId }, // Partition key
      TransactionID: { S: transactionID }, // Sort key
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
  };

  return ddb.updateItem(params).promise();
}
