import jwtVerifier from "../../services/jwtVerifier.mjs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const messagesTableName = process.env.MESSAGES_TABLE;
const usersTableName = process.env.USERS_TABLE;

/**
 * HTTP get method to get authenticated user's messages from DynamoDB.
 */
export const getMyMessages = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getMyMessages only accept GET method, you tried: ${event.httpMethod}`
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

  const sentParams = {
    TableName: messagesTableName,
    KeyConditionExpression: "sender_id = :s",
    ExpressionAttributeValues: {
      ":s": user_id,
    },
  };
  const receivedParams = {
    TableName: messagesTableName,
    IndexName: "RecipientIdIndex",
    KeyConditionExpression: "recipient_id = :r",
    ExpressionAttributeValues: {
      ":r": user_id,
    },
  };

  var response;

  try {
    const sentMessagesQuery = ddbDocClient.send(new QueryCommand(sentParams));
    const recievedMessagesQuery = ddbDocClient.send(
      new QueryCommand(receivedParams)
    );
    const promises = await Promise.all([
      sentMessagesQuery,
      recievedMessagesQuery,
    ]);
    const sentMessages = promises[0].Items;
    const receivedMessages = promises[1].Items;
    const messages = mergeSort(sentMessages, receivedMessages);

    /**
     * Build channels array from messages array.
     * Each channel contains the correspondent's info and the message history.
     * The message history is sorted by date, descending.
     * The channels array is sorted by last message, descending.
     */
    const channels = [];
    for (const message of messages) {
      const correspondent_id =
        message.sender_id == user_id ? message.recipient_id : message.sender_id;
      const channel = channels.find(
        (channel) => channel.contact.accountId == correspondent_id
      );
      if (channel) {
        // Add message to existing channel
        channel.messageHistory.push({
          sender_id: message.sender_id,
          text: message.text,
          created_at: message.created_at,
        });
        channel.last_message = message.created_at;
      } else {
        // Get correspondent info from DynamoDB
        const params = {
          TableName: usersTableName,
          KeyConditionExpression: "user_id = :user_id",
          ExpressionAttributeValues: {
            ":user_id": correspondent_id,
          },
        };
        const data = await ddbDocClient.send(new QueryCommand(params));
        const correspondent = data.Items[0];
        // Add new channel
        channels.push({
          contact: {
            name: correspondent.firstName + " " + correspondent.lastName,
            profilePicture: correspondent.profilePicture,
            accountId: correspondent_id,
          },
          messageHistory: [
            {
              sender_id: message.sender_id,
              text: message.text,
              timestamp: message.created_at,
            },
          ],
          last_message: message.created_at,
        });
      }
    }

    // Sort channels by last message, descending
    channels.sort((a, b) => {
      return new Date(b.last_message) - new Date(a.last_message);
    });

    response = {
      statusCode: 200,
      body: JSON.stringify(channels),
    };
  } catch (err) {
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

// Merge sort based on created_at
function mergeSort(arr1, arr2) {
  const merged = [];
  let i = 0;
  let j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (new Date(arr1[i].created_at) > new Date(arr2[j].created_at)) {
      merged.push(arr1[i]);
      i++;
    } else {
      merged.push(arr2[j]);
      j++;
    }
  }
  while (i < arr1.length) {
    merged.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    merged.push(arr2[j]);
    j++;
  }
  return merged;
}
