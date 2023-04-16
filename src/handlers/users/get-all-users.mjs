import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.USERS_TABLE;

/**
 * HTTP get method to get all users from DynamoDB.
 */
export const getAllUsers = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllUsers only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  var params = {
    TableName: tableName,
  };

  var response;

  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    var users = data.Items;
    response = {
      statusCode: 200,
      body: JSON.stringify(users),
    };
  } catch (err) {
    console.log("Error", err);
    response = {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ message: err.message }),
    };
  }

  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
