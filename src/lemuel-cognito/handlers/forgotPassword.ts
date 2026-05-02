import {
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { client } from "../cognitoClient";
import { env } from "../models/env";
import { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (body: {
  email: string;
}): Promise<APIGatewayProxyResult> => {
  const input: ForgotPasswordCommandInput = {
    ClientId: env.COGNITO_CLIENT_ID,
    Username: body.email,
  };
  await client.send(new ForgotPasswordCommand(input));
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Password reset email sent" }),
  };
};