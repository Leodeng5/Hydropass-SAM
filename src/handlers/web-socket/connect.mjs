import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const marshallOptions = {
  removeUndefinedValues: true,
};
const translateConfig = { marshallOptions };
const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);
const tableName = process.env.CONNECTIONS_TABLE;

export const connect = async (event) => {
  console.info("received:", event);
  try {
    const { userId } = event.queryStringParameters;
    const { connectionId } = event.requestContext;
    const params = {
      TableName: tableName,
      Item: {
        user_id: userId,
        connection_id: connectionId,
      },
    };
    await ddbDocClient.send(new PutCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connected successfully." }),
    };
  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error connecting.", err }),
    };
  }
};
