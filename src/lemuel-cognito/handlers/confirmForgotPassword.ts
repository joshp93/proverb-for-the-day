import {
  ConfirmForgotPasswordCommand,
  ConfirmForgotPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { client } from "../cognitoClient";
import { env } from "../models/env";
import { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (body: {
  email: string;
  code: string;
  password: string;
}): Promise<APIGatewayProxyResult> => {
  const input: ConfirmForgotPasswordCommandInput = {
    ClientId: env.COGNITO_CLIENT_ID,
    Username: body.email,
    ConfirmationCode: body.code,
    Password: body.password,
  };
  await client.send(new ConfirmForgotPasswordCommand(input));
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: "Password has been reset" }),
  };
};