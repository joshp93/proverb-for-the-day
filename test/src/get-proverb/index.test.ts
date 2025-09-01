import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../../src/get-proverb/index";

describe("get-proverbs handler", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  beforeEach(() => {
    ddbMock.resetHistory();
    process.env.TABLE_NAME = "TestTable";
  });

  it("returns the proverb for the day for a version", async () => {
    ddbMock
      .on(GetCommand, {
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: "proverb-for-the-day",
          sk: "proverb-for-the-day",
        },
      })
      .resolves({
        Item: {
          pk: "proverb-for-the-day",
          sk: "proverb-for-the-day",
          ref: "Proverbs10:1",
        },
      });

    ddbMock
      .on(GetCommand, {
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: "kjv#Proverbs10:1",
          sk: "Proverbs10:1",
        },
      })
      .resolves({
        Item: {
          pk: "kjv#Proverbs10:1",
          sk: "Proverbs10:1",
          proverb: {
            ref: "Proverbs 10:1",
            proverb: "A wise son maketh a glad father...",
          },
        },
      });

    const event = {
      pathParameters: { version: "kjv" },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(result.body).toContain("A wise son maketh a glad father");
  });
});
