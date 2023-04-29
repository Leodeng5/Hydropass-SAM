import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.LISTINGS_TABLE;

/**
 * HTTP get method to get featured listings from DynamoDB.
 */
export const getListingById = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getListingById only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  var params = {
    TableName: tableName,
    IndexName: "ListingIdIndex",
    KeyConditionExpression: "listing_id = :listing_id",
    ExpressionAttributeValues: {
      ":listing_id": event.pathParameters.id,
    },
  };

  var response;

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    if (data.Items.length == 0) {
      console.log("Listing not found");
      response = {
        statusCode: 404,
        body: JSON.stringify({ message: "Listing not found" }),
      };
    } else {
      const listing = data.Items[0];
      response = {
        statusCode: 200,
        body: JSON.stringify(listing),
      };
    }
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
