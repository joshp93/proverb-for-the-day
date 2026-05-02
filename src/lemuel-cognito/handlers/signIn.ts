import {
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { client } from "../cognitoClient";
import { env } from "../models/env";
import { APIGatewayProxyResult } from "aws-lambda";
import { signInSchema } from "../models/signInSchema";

export const handler = async (body: unknown): Promise<APIGatewayProxyResult> => {
  const parsed = signInSchema.safeParse(body);

  if (!parsed.success) {
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Unauthorized",
        message: "Email and password are required",
      }),
    };
  }

  const { email, password } = parsed.data;

  const input: AdminInitiateAuthCommandInput = {
    UserPoolId: env.COGNITO_USER_POOL_ID,
    ClientId: env.COGNITO_CLIENT_ID,
    AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  };
  const response = await client.send(new AdminInitiateAuthCommand(input));
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response.AuthenticationResult),
  };
};