import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.USERS_TABLE;

/**
 * HTTP get method to get user from DynamoDB by id.
 */
export const getUserById = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getUserById only accept GET method, you tried: ${event.httpMethod}`
    );
  }
  // All log statements are written to CloudWatch
  console.info("received:", event);

  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_id = :user_id",
    ExpressionAttributeValues: {
      ":user_id": event.pathParameters.id,
    },
  };

  var response;

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    if (data.Items.length == 0) {
      console.log("User not found");
      response = {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    } else {
      const user = data.Items[0];
      response = {
        statusCode: 200,
        body: JSON.stringify(user),
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
