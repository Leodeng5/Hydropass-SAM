import jwtVerifier from "../../services/jwtVerifier.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.LISTINGS_TABLE;

/**
 * HTTP get method to get authenticated user's listings from DynamoDB.
 */
export const getMyListings = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMyListings only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  var user_id;

  try {
    const authHeader =
      event.headers.Authorization || event.headers.authorization;
    const token = authHeader;
    const decodedToken = await jwtVerifier.verify(token);
    user_id = decodedToken["username"];
    console.log("Token authorized", user_id);
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized token" }),
    };
  }

  // params for QueryCommand
  const params = {
    TableName: tableName,
    KeyConditionExpression: "host_id = :h",
    ExpressionAttributeValues: {
      ":h": user_id,
    },
  };

  var response;

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    const listings = data.Items;
    response = {
      statusCode: 200,
      body: JSON.stringify(listings),
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
