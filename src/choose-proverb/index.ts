import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ProverbForTheDayEntitySchema,
  RefsEntitySchema,
} from "../models/proverbStoreSchemas";

export const handler = async (): Promise<void> => {
  const client = DynamoDBDocumentClient.from(
    new (require("@aws-sdk/client-dynamodb").DynamoDBClient)({})
  );
  const tableName = process.env.TABLE_NAME!;
  const refsResult = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        pk: "refs",
        sk: "refs",
      },
    })
  );
  const refs = RefsEntitySchema.parse(refsResult.Item);

  if (refs.usedRefs.length === refs.allRefs.length) {
    refs.usedRefs = [];
  }
  const unusedRefs = refs.allRefs.filter((ref) => !refs.usedRefs.includes(ref));
  const randomRef = unusedRefs[Math.floor(Math.random() * unusedRefs.length)];

  refs.usedRefs.push(randomRef);

  const putProverbForTheDayPromise = client.send(
    new PutCommand({
      TableName: tableName,
      Item: ProverbForTheDayEntitySchema.parse({
        pk: "proverb-for-the-day",
        sk: "proverb-for-the-day",
        ref: randomRef,
      }),
    })
  );
  const putRefsPromise = client.send(
    new PutCommand({
      TableName: tableName,
      Item: refs,
    })
  );
  await Promise.all([putProverbForTheDayPromise, putRefsPromise]);
};
