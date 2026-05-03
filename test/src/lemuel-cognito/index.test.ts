import { CognitoIdentityProviderClient, SignUpCommand, AdminInitiateAuthCommand, ForgotPasswordCommand, ConfirmForgotPasswordCommand, AdminGetUserCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../../src/lemuel-cognito/index";

describe("lemuel-cognito handler", () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  beforeEach(() => {
    cognitoMock.resetHistory();
    process.env.COGNITO_CLIENT_ID = "test-client-id";
    process.env.COGNITO_USER_POOL_ID = "test-pool-id";
  });

  const makeEvent = (path: string, body: object): APIGatewayProxyEvent => ({
    path,
    body: JSON.stringify(body),
  } as APIGatewayProxyEvent);

  describe("sign-up", () => {
    it("signs up successfully", async () => {
      cognitoMock.on(SignUpCommand).resolves({
        UserSub: "user-123",
        CodeDeliveryDetails: {
          Destination: "test@example.com",
          DeliveryMedium: "EMAIL",
          AttributeName: "email",
        },
      });

      const result = await handler(makeEvent("/auth/sign-up", { email: "test@example.com", password: "Password123" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).userSub).toBe("user-123");
    });

    it("returns 400 on error", async () => {
      cognitoMock.on(SignUpCommand).rejects(new Error("User already exists"));

      const result = await handler(makeEvent("/auth/sign-up", { email: "test@example.com", password: "Password123" }));

      expect(result.statusCode).toBe(400);
    });
  });

  describe("sign-in", () => {
    it("signs in successfully", async () => {
      cognitoMock.on(AdminInitiateAuthCommand).resolves({
        AuthenticationResult: {
          AccessToken: "access-token",
          IdToken: "id-token",
          RefreshToken: "refresh-token",
          ExpiresIn: 3600,
          TokenType: "Bearer",
        },
      });

      const result = await handler(makeEvent("/auth/sign-in", { email: "test@example.com", password: "Password123" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).AccessToken).toBe("access-token");
    });

    it("returns 401 when missing email", async () => {
      const result = await handler(makeEvent("/auth/sign-in", { password: "Password123" }));

      expect(result.statusCode).toBe(401);
    });

    it("returns 401 when missing password", async () => {
      const result = await handler(makeEvent("/auth/sign-in", { email: "test@example.com" }));

      expect(result.statusCode).toBe(401);
    });

    it("returns 400 on invalid credentials", async () => {
      cognitoMock.on(AdminInitiateAuthCommand).rejects(new Error("NotAuthorizedException"));

      const result = await handler(makeEvent("/auth/sign-in", { email: "test@example.com", password: "WrongPassword" }));

      expect(result.statusCode).toBe(400);
    });
  });

  describe("forgot-password", () => {
    it("sends password reset email successfully", async () => {
      cognitoMock.on(ForgotPasswordCommand).resolves({});

      const result = await handler(makeEvent("/auth/forgot-password", { email: "test@example.com" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe("Password reset email sent");
    });

    it("returns 400 for non-existent user", async () => {
      cognitoMock.on(ForgotPasswordCommand).rejects(new Error("UserNotFoundException"));

      const result = await handler(makeEvent("/auth/forgot-password", { email: "nonexistent@example.com" }));

      expect(result.statusCode).toBe(400);
    });
  });

  describe("confirm-forgot-password", () => {
    it("resets password successfully", async () => {
      cognitoMock.on(ConfirmForgotPasswordCommand).resolves({});

      const result = await handler(makeEvent("/auth/confirm-forgot-password", { email: "test@example.com", code: "123456", password: "NewPassword123" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe("Password has been reset");
    });

    it("returns 400 on invalid code", async () => {
      cognitoMock.on(ConfirmForgotPasswordCommand).rejects(new Error("CodeMismatchException"));

      const result = await handler(makeEvent("/auth/confirm-forgot-password", { email: "test@example.com", code: "wrong", password: "NewPassword123" }));

      expect(result.statusCode).toBe(400);
    });
  });

  describe("check-user", () => {
    it("returns exists true when user exists", async () => {
      cognitoMock.on(AdminGetUserCommand).resolves({
        Username: "user-123",
      });

      const result = await handler(makeEvent("/auth/check-user", { email: "test@example.com" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).exists).toBe(true);
    });

    it("returns exists false when user does not exist", async () => {
      const error = new Error("User does not exist");
      error.name = "UserNotFoundException";
      cognitoMock.on(AdminGetUserCommand).rejects(error);

      const result = await handler(makeEvent("/auth/check-user", { email: "nonexistent@example.com" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).exists).toBe(false);
    });
  });

  describe("confirm-sign-up", () => {
    it("confirms sign up successfully", async () => {
      cognitoMock.on(ConfirmSignUpCommand).resolves({});

      const result = await handler(makeEvent("/auth/confirm-sign-up", { email: "test@example.com", code: "123456" }));

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).message).toBe("Email verified successfully");
    });

    it("returns 400 on invalid code", async () => {
      cognitoMock.on(ConfirmSignUpCommand).rejects(new Error("CodeMismatchException"));

      const result = await handler(makeEvent("/auth/confirm-sign-up", { email: "test@example.com", code: "wrong" }));

      expect(result.statusCode).toBe(400);
    });
  });

  describe("unhandled paths", () => {
    it("returns 404 for unknown paths", async () => {
      const result = await handler(makeEvent("/auth/unknown", {}));

      expect(result.statusCode).toBe(404);
    });
  });
});