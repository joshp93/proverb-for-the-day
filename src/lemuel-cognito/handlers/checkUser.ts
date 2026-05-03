import {
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { client } from "../cognitoClient";
import { env } from "../models/env";
import { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (body: {
  email: string;
}): Promise<APIGatewayProxyResult> => {
  try {
    await client.send(
      new AdminGetUserCommand({
        UserPoolId: env.COGNITO_USER_POOL_ID,
        Username: body.email,
      })
    );
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ exists: true }),
    };
  } catch (err) {
    const error = err as { name?: string };
    if (error.name === "UserNotFoundException") {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ exists: false }),
      };
    }
    throw err;
  }
};