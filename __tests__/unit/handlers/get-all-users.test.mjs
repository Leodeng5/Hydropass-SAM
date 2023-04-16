// Import getAllItemsHandler function from get-all-items.mjs
import { getAllUsers } from "../../../src/handlers/users/get-all-users.mjs";
// Import dynamodb from aws-sdk
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";

// This includes all tests for getAllItemsHandler()
describe("Test getAllUsersHandler", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);

  beforeEach(() => {
    ddbMock.reset();
  });

  it("should return users", async () => {
    const users = [{ user_id: "userid1" }, { user_id: "userid2" }];

    // Return the specified value whenever the spied scan function is called
    ddbMock.on(ScanCommand).resolves({
      Items: users,
    });

    const event = {
      httpMethod: "GET",
    };

    const result = await getAllUsers(event);

    const expectedResult = {
      statusCode: 200,
      body: JSON.stringify(users),
    };

    // Compare the result with the expected result
    expect(result).toEqual(expectedResult);
  });
});
