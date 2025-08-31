import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Refs } from "./models";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
  const refs: Refs = refsResult.Item! as Refs;

  if (refs.usedRefs.length === refs.allRefs.length) {
    refs.usedRefs = [];
  }
  const unusedRefs = refs.allRefs.filter((ref) => !refs.usedRefs.includes(ref));
  const randomRef = unusedRefs[Math.floor(Math.random() * unusedRefs.length)];

  refs.usedRefs.push(randomRef);
  console.debug("Getting ref:", randomRef);
  const proverbForTheDayResult = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: {
        pk: `${event.pathParameters!.version}#${randomRef}`,
        sk: randomRef,
      },
    })
  );
  const proverbForTheDay = proverbForTheDayResult.Item!.proverb;
  console.debug("Proverb for the day:", JSON.stringify(proverbForTheDay));
  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: refs,
    })
  );

  return {
    statusCode: 200,
    body: JSON.stringify(proverbForTheDay),
  };
};
