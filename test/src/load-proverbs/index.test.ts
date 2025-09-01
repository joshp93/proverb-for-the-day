import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import * as fs from "fs";
import * as path from "path";
import { handler } from "../../../src/load-proverbs/index";

describe(handler.name, () => {
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

  it("Should batch write proverbs in groups of 25 with correct PK/SK/proverb", async () => {
    const {
      LoadProverbsEventSchema,
    } = require("../../../src/models/eventSchemas");
    const parsed = LoadProverbsEventSchema.parse(JSON.parse(testJson));
    ddbMock.on(BatchWriteCommand).resolves({});

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

      for (const item of requestItems) {
        expect(item.PutRequest!.Item!.pk).toMatch(/^kjv#Proverbs\d+:\d+$/);
        expect(item.PutRequest!.Item!.sk).toMatch(/^Proverbs\d+:\d+$/);
        expect(typeof item.PutRequest!.Item!.proverb).toBe("object");
        expect(typeof item.PutRequest!.Item!.proverb.proverb).toBe("string");
      }
    }
  });
});
