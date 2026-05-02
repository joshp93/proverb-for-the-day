import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler as signUpHandler } from "./handlers/signUp";
import { handler as confirmSignUpHandler } from "./handlers/confirmSignUp";
import { handler as signInHandler } from "./handlers/signIn";
import { handler as forgotPasswordHandler } from "./handlers/forgotPassword";
import { handler as confirmForgotPasswordHandler } from "./handlers/confirmForgotPassword";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    if (path.endsWith("/sign-up")) {
      return await signUpHandler(body);
    }

    if (path.endsWith("/confirm-sign-up")) {
      return await confirmSignUpHandler(body);
    }

    if (path.endsWith("/sign-in")) {
      return await signInHandler(body);
    }

    if (path.endsWith("/forgot-password")) {
      return await forgotPasswordHandler(body);
    }

    if (path.endsWith("/confirm-forgot-password")) {
      return await confirmForgotPasswordHandler(body);
    }

    return {
      statusCode: 404,
      body: "Not found",
    };
  } catch (error) {
    console.error("Cognito error:", error);
    const err = error as { name?: string; message?: string };
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: err.name || "UnknownError",
        message: err.message || "An error occurred",
      }),
    };
  }
};