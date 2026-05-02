import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

export const client = new CognitoIdentityProviderClient({});

export const clientId = process.env.COGNITO_CLIENT_ID!;
export const userPoolId = process.env.COGNITO_USER_POOL_ID!;