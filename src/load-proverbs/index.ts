import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { LoadProverbsEvent, LoadProverbsEventSchema } from "./eventSchemas";
import { ProverbEntitySchema } from "./proverbStoreSchemas";

export const handler = async (event: LoadProverbsEvent): Promise<void> => {
  console.debug("Event:", JSON.stringify(event));
  LoadProverbsEventSchema.parse(event);

  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
  const tableName = process.env.TABLE_NAME!;
  const batchSize = 25;

  const items = event.proverbs.map((proverb) => {
    const refNoSpace = proverb.ref.replace(/\s+/g, "");
    const pk = `${event.version}#${refNoSpace}`;
    const sk = refNoSpace;

    const proverbEntity = ProverbEntitySchema.parse({
      pk,
      sk,
      proverb,
    });
    return {
      PutRequest: {
        Item: proverbEntity,
      },
    };
  });

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const command = new BatchWriteCommand({
      RequestItems: {
        [tableName]: batch,
      },
    });
    console.debug("Batch Write Command:", JSON.stringify(command));
    const response = await client.send(command);
    console.debug("Batch Write Response:", JSON.stringify(response));
  }
};
