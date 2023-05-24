import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const marshallOptions = {
  removeUndefinedValues: true,
};
const translateConfig = { marshallOptions };
const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);
const tableName = process.env.CONNECTIONS_TABLE;

export const disconnect = async (event) => {
  console.info("received:", event);
  try {
    const { connectionId } = event.requestContext;
    const queryParams = {
      TableName: tableName,
      IndexName: "ConnectionIdIndex",
      KeyConditionExpression: "connection_id = :connection_id",
      ExpressionAttributeValues: {
        ":connection_id": connectionId,
      },
    };
    const data = await ddbDocClient.send(new QueryCommand(queryParams));
    const userId = data.Items[0].user_id;
    const deleteParams = {
      TableName: tableName,
      Key: {
        connection_id: connectionId,
        user_id: userId,
      },
    };
    console.info("deleting: ", deleteParams);
    await ddbDocClient.send(new DeleteCommand(deleteParams));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Disconnected successfully." }),
    };
  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error disconnecting.", err }),
    };
  }
};
