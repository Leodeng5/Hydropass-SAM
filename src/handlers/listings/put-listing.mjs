import { v4 as uuidv4 } from "uuid";
import jwtVerifier from "../../services/jwtVerifier.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const marshallOptions = {
  removeUndefinedValues: true,
};
const translateConfig = { marshallOptions };
const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);

const tableName = process.env.LISTINGS_TABLE;

/**
 * HTTP post method to add a listing to DynamoDB.
 */
export const putListing = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `putListing only accept POST method, you tried: ${event.httpMethod}`
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

  const body = JSON.parse(event.body);
  const {
    listingImages,
    propertyName,
    propertyAddress,
    dailyRate,
    propertyDescription,
    propertyRules,
    selectedActivities,
    maximumGuests,
  } = body;

  const params = {
    TableName: tableName,
    Item: {
      host_id: user_id,
      listing_id: uuidv4(),
      name: propertyName,
      location: propertyAddress,
      images: listingImages,
      dailyRate: dailyRate,
      description: propertyDescription,
      rules: propertyRules,
      activities: selectedActivities,
      maxGuests: maximumGuests,
    },
  };

  var response;

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - listing added", data);
    response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };
  } catch (err) {
    console.log("Error", err.stack);
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
