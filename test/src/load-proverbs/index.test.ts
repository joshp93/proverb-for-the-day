import { handler } from "../../../src/load-proverbs/index";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import * as fs from "fs";
import * as path from "path";
import { LoadProverbsEvent } from "../../../src/load-proverbs/models";

describe("handler", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  const testJsonPath = path.join(__dirname, "test-data", "kjv.json");
  let testJson: string;

  beforeAll(() => {
    testJson = fs.readFileSync(testJsonPath, "utf8");
    process.env.TABLE_NAME = "TestTable";
  });

  beforeEach(() => {
    ddbMock.resetHistory();
  });

  it("Should batch write proverbs in groups of 25", async () => {
    const parsed: LoadProverbsEvent = JSON.parse(testJson);
    await handler(parsed);
    const total = parsed.proverbs.length;
    const expectedBatches = Math.ceil(total / 25);
    expect(ddbMock.commandCalls(BatchWriteCommand).length).toBe(
      expectedBatches
    );

    for (let i = 0; i < expectedBatches; i++) {
      const call = ddbMock.commandCalls(BatchWriteCommand)[i];
      const batchStart = i * 25;
      const batchEnd = Math.min(batchStart + 25, total);
      const requestItems = call.args[0].input.RequestItems!["TestTable"];
      expect(requestItems.length).toBe(batchEnd - batchStart);
      expect(ddbMock.commandCalls(BatchWriteCommand).length).toBe(
        expectedBatches
      );
    }
  });
});
