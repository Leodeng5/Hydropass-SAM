import AWS from "aws-sdk";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const marshallOptions = {
  removeUndefinedValues: true,
};
const translateConfig = { marshallOptions };
const ddbDocClient = DynamoDBDocumentClient.from(client, translateConfig);
const messagesTableName = process.env.MESSAGES_TABLE;
const connectionsTableName = process.env.CONNECTIONS_TABLE;

export const sendMessage = async (event) => {
  console.info("received:", event);
  try {
    // Post message to DynamoDB
    const { senderId, recipientId, text } = JSON.parse(event.body);
    const timestamp = Date.now();
    const message = {
      sender_id: senderId,
      recipient_id: recipientId,
      text,
      created_at: timestamp,
    };
    const params = {
      TableName: messagesTableName,
      Item: message,
    };
    await ddbDocClient.send(new PutCommand(params));

    // Get recipient's connectionId from DynamoDB
    const query = {
      TableName: connectionsTableName,
      KeyConditionExpression: "user_id = :userId",
      ExpressionAttributeValues: {
        ":userId": recipientId,
      },
    };
    const { Items } = await ddbDocClient.send(new QueryCommand(query));
    if (Items.length === 0) {
      console.info("Recipient is offline.");
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Recipient is offline." }),
      };
    } else {
      console.info("Recipient is online. Emitting message.");
      const emitPromises = [];
      for (const recipientConnection of Items) {
        const recipientConnectionId = recipientConnection.connection_id;
        // Emit message to recipient's web socket
        const endpoint = `${event.requestContext.domainName}/${event.requestContext.stage}`;
        const apigwManagementApi = new AWS.ApiGatewayManagementApi({
          apiVersion: "2018-11-29",
          endpoint: endpoint,
        });
        emitPromises.push(
          apigwManagementApi
            .postToConnection({
              ConnectionId: recipientConnectionId,
              Data: JSON.stringify(message),
            })
            .promise()
        );
      }
      await Promise.all(emitPromises);

      console.info("Message sent successfully");

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Message sent successfully" }),
      };
    }
  } catch (err) {
    console.log("Error: ", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error sending message.", err }),
    };
  }
};
