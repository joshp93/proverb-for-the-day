import {
  SignUpCommand,
  SignUpCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { client } from "../cognitoClient";
import { env } from "../models/env";
import { APIGatewayProxyResult } from "aws-lambda";

export const handler = async (body: {
  email: string;
  password: string;
}): Promise<APIGatewayProxyResult> => {
  const input: SignUpCommandInput = {
    ClientId: env.COGNITO_CLIENT_ID,
    Username: body.email,
    Password: body.password,
    UserAttributes: [
      {
        Name: "email",
        Value: body.email,
      },
    ],
  };
  const response = await client.send(new SignUpCommand(input));
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userSub: response.UserSub,
      codeDeliveryDetails: response.CodeDeliveryDetails,
    }),
  };
};