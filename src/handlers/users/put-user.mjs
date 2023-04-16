import jwtVerifier from "../../services/jwtVerifier.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const marshallOptions = {
  removeUndefinedValues: true,
};
const translateConfig = { marshallOptions };
const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);

const tableName = process.env.USERS_TABLE;

/**
 * HTTP post method to add a user to DynamoDB.
 */
export const putUser = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `putUser only accept POST method, you tried: ${event.httpMethod}`
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
    firstName,
    lastName,
    streetAddress,
    cityAddress,
    zipCodeAddress,
    email,
    username,
  } = body;

  const params = {
    TableName: tableName,
    Item: {
      user_id: user_id,
      firstName: firstName,
      lastName: lastName,
      streetAddress: streetAddress,
      cityAddress: cityAddress,
      zipCodeAddress: zipCodeAddress,
      email: email,
      username: username,
    },
  };

  var response;

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - user added", data);
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
