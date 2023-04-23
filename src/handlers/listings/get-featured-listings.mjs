import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.LISTINGS_TABLE;

/**
 * HTTP get method to get featured listings from DynamoDB.
 */
export const getFeaturedListings = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getFeaturedListings only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  var params = {
    TableName: tableName,
    IndexName: "ListingFeaturedIndex",
    KeyConditionExpression: "featured = :featured",
    ExpressionAttributeValues: {
      ":featured": 1,
    },
  };

  var response;

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    var listings = data.Items;
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
