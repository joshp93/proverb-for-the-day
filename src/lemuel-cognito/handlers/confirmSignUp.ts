import {
  ConfirmSignUpCommand,
  ConfirmSignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { client } from "../cognitoClient";
import { env } from "../models/env";
import { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (body: {
  email: string;
  code: string;
}): Promise<APIGatewayProxyResult> => {
  const input: ConfirmSignUpCommandInput = {
    ClientId: env.COGNITO_CLIENT_ID,
    Username: body.email,
    ConfirmationCode: body.code,
  };
  await client.send(new ConfirmSignUpCommand(input));
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Email verified successfully" }),
  };
};