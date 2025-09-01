import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { handler } from "../../../src/choose-proverb/index";

describe("choose-proverb handler", () => {
  const ddbMock = mockClient(DynamoDBDocumentClient);
  beforeEach(() => {
    ddbMock.resetHistory();
    process.env.TABLE_NAME = "TestTable";
  });

  it("chooses a random unused proverb and updates refs and proverb-for-the-day", async () => {
    ddbMock.on(GetCommand).resolves({
      Item: {
        pk: "refs",
        sk: "refs",
        allRefs: ["Proverbs10:1", "Proverbs10:2"],
        usedRefs: ["Proverbs10:1"],
      },
    });
    ddbMock.on(PutCommand).resolves({});
    await handler();
    expect(ddbMock.commandCalls(PutCommand).length).toBe(2);
    const refsPut = ddbMock.commandCalls(PutCommand)[1].args[0].input.Item;
    expect(refsPut!.usedRefs.length).toBe(2);
  });
});
